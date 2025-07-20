(function($){
    $('#posts-filter').on('submit', async function(e){
        let found = false;
        let action = $('[name="action"]').val();
        let action2 = $('[name="action2"]').val();
        if(action === "mp4togif_bulk_convert" || action2 === "mp4togif_bulk_convert") found = true;
        if(!found) return; 

        e.preventDefault();

        let ids = $('[name="media[]"]:checked').map(function(){ return $(this).val(); }).get();
        if(ids.length === 0) { alert('Aucun média sélectionné !'); return; }

        let loader = $('<div id="mp4togif-loader" style="position:fixed;z-index:99999;top:0;left:0;width:100vw;height:100vh;background:#fff;opacity:.95;display:flex;align-items:center;justify-content:center;font-size:1.7em;color:#2271b1;"><div style="text-align:center;"><span id="mp4togif-loader-txt"></span><br><progress id="mp4togif-bulk-progress" max="100" value="0" style="width:340px;height:18px;"></progress><div id="mp4togif-bulk-spinner" style="display:none;margin:16px;"><span class="mp4togif-spinner"></span> Génération du GIF…</div></div></div>');
        $('body').append(loader);
        let bulkProgress = $('#mp4togif-bulk-progress')[0];

        let urlMap = {};
        await Promise.all(ids.map(async function(id){
            const res = await fetch(WPMP4TogifSettings.ajaxurl+'?action=mp4togif_get_attachment_url&id='+id);
            const data = await res.json();
            urlMap[id] = data.url || '';
        }));

        for(let idx=0; idx<ids.length; idx++){
            let id = ids[idx];
            let url = urlMap[id];
            if(!url.match(/\.mp4$/i)){ $('#mp4togif-loader-txt').text('Le fichier '+id+' n\'est pas un MP4.'); continue; }

            $('#mp4togif-loader-txt').html('Vidéo '+(idx+1)+'/'+ids.length);

            try{
                let resp = await fetch(url);
                if(!resp.ok) throw new Error('Impossible de télécharger : '+url);
                let fileBlob = await resp.blob();
                const video = document.createElement('video');
                video.src = URL.createObjectURL(fileBlob);
                video.currentTime = 0;
                await new Promise((res, rej)=>{
                    video.onloadedmetadata = ()=> res();
                    video.onerror = ()=> rej("Erreur lors du chargement de la vidéo.");
                });
                let aspectRatio = video.videoWidth/video.videoHeight || 16/9;
                let width = WPMP4TogifSettings.resolution, height = Math.round(width/aspectRatio);

                let fps = WPMP4TogifSettings.fps;
                let totalFrames = Math.max(2, Math.round(video.duration*fps));
                let interval = video.duration/totalFrames;

                let gif = new GIF({
                    workers: 2,
                    quality: 10,
                    width: width,
                    height: height,
                    workerScript: WPMP4TogifSettings.worker_url
                });
                bulkProgress.max = totalFrames;
                bulkProgress.value = 0;
                bulkProgress.style.display = '';

                async function captureFrame(i){
                    return new Promise(res=>{
                        video.currentTime = i*interval;
                        video.onseeked = ()=>{
                            let canvas = document.createElement("canvas");
                            canvas.width = width; canvas.height = height;
                            let ctx = canvas.getContext("2d");
                            ctx.drawImage(video,0,0,width,height);
                            gif.addFrame(ctx.getImageData(0,0,width,height), {delay:Math.round(1000/fps)});
                            $('#mp4togif-loader-txt').html('Vidéo '+(idx+1)+'/'+ids.length+' – Image '+(i+1)+'/'+totalFrames);
                            bulkProgress.value = i+1;
                            res();
                        };
                    });
                }
                for(let i=0;i<totalFrames;i++){
                    await captureFrame(i);
                }
                bulkProgress.style.display = 'none';
                $('#mp4togif-bulk-spinner').show();

                await new Promise((resolve, reject)=>{
                    gif.on('finished', resolve);
                    gif.on('error', reject);
                    gif.render();
                }).then(async function(blob){
                    $('#mp4togif-bulk-spinner').hide();
                    $('#mp4togif-loader-txt').html('Vidéo '+(idx+1)+'/'+ids.length+' : upload du GIF...');
                    let formData = new FormData();
                    formData.append("action", "mp4togif_upload_ajax");
                    formData.append("nonce", WPMP4TogifSettings.nonce);
                    formData.append("gif_file", blob, 'mp4togif_'+id+'.gif');
                    formData.append("source_id", id);
                    let up = await fetch(WPMP4TogifSettings.ajaxurl, {method:"POST",body:formData});
                    let d = await up.json();
                    if(d.success)
                        $('#mp4togif-loader-txt').html('GIF ajouté !');
                    else
                        $('#mp4togif-loader-txt').html('Erreur upload GIF !');
                    await new Promise(r=>setTimeout(r, 800));
                });
            }catch(e){
                $('#mp4togif-loader-txt').text('Erreur ID '+id+' ('+e+')');
                await new Promise(r=>setTimeout(r, 1200));
            }
        }
        loader.remove();
        location.reload();
    });
})(jQuery);