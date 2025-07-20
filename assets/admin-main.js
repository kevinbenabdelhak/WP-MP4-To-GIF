(function(){
    let mp4File = null, generatedGifBlob = null, gif = null;
    const $ = sel => document.querySelector(sel);
    function getLatestSettings() {
        let resoInput = document.querySelector('input[name="mp4togif_resolution"]');
        let fpsInput  = document.querySelector('input[name="mp4togif_fps"]');
        let resolution = resoInput ? parseInt(resoInput.value) : WPMP4TogifSettings.resolution;
        let fps = fpsInput ? parseInt(fpsInput.value) : WPMP4TogifSettings.fps;
        resolution = Math.max(100, Math.min(2000, resolution||WPMP4TogifSettings.resolution));
        fps = Math.max(1, Math.min(20, fps||WPMP4TogifSettings.fps));
        return {resolution, fps};
    }

    $('#mp4input').addEventListener('change', function(e) {
        mp4File = e.target.files[0] || null;
        $('#gifPreview').style.display = 'none';
        $('#downloadGif').style.display = 'none';
        $('#upload-section').style.display = 'none';
        $('#progress').textContent = '';
        $('#uploadResult').textContent = '';
        generatedGifBlob = null;
        $('#gifFrameProgress').style.display = 'none';
        $('#gifGenerationLoader').style.display = 'none';
    });

    function showProgress(txt) { $('#progress').textContent = txt; }
    function showLoading(show) { $('#loadingIndicator').style.display = show ? 'block' : 'none'; }

    $('#convertBtn').addEventListener('click', async () => {
        if (!mp4File) { alert('Sélectionnez un fichier MP4 !'); return; }
        let settings = getLatestSettings();
        let resolution = settings.resolution;
        let fps = settings.fps;

        showProgress('Chargement...');
        showLoading(true);
        $('#convertBtn').disabled = true;

        const url = URL.createObjectURL(mp4File);
        const video = document.createElement('video');
        video.src = url;
        video.currentTime = 0;

        await new Promise((resolve, reject) => {
            video.addEventListener('loadedmetadata', resolve, {once:true});
            video.addEventListener('error', ()=>reject('Erreur de chargement vidéo.'), {once:true});
        }).catch(error => {
            showProgress(`Erreur: ${error}`);
            showLoading(false);
            $('#convertBtn').disabled = false;
            return;
        });

        let totalFrames = Math.max(2, Math.round(video.duration * fps));
        let interval = video.duration / totalFrames;
        let aspectRatio = video.videoWidth / video.videoHeight || 16/9;
        let width = resolution, height = Math.round(width / aspectRatio);

gif = new GIF({
    workers: 2,
    quality: 10,
    width: width,
    height: height,
    workerScript: WPMP4TogifSettings.worker_url 
});

        let progressBar = $('#gifFrameProgress');
        progressBar.max = totalFrames;
        progressBar.value = 0;
        progressBar.style.display = '';

        for(let i=0;i<totalFrames;i++) {
            video.currentTime = i*interval;
            await new Promise(res=>{
                video.onseeked = ()=>{
                    let canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    let ctx = canvas.getContext('2d');
                    ctx.drawImage(video,0,0,width,height);
                    gif.addFrame(ctx.getImageData(0,0,width,height), {delay:Math.round(1000/fps)});
                    showProgress(`Image ${i+1} / ${totalFrames}…`);
                    progressBar.value = i+1;
                    res();
                }
            });
        }

        showProgress('Génération du GIF...');
        progressBar.style.display = 'none';
        $('#gifGenerationLoader').style.display = '';

        gif.on('progress', function(p) {
            showProgress(`Génération du GIF: ${Math.round(p * 100)}%`);
        });

        gif.on('finished', function(blob){
            $('#gifGenerationLoader').style.display = 'none';
            generatedGifBlob = blob;
            const gifURL = URL.createObjectURL(blob);
            $('#downloadGif').href = gifURL;
            $('#downloadGif').download = mp4File.name.replace(/\.mp4$/i, '.gif');
            $('#downloadGif').style.display = '';
            $('#gifPreview').src = gifURL;
            $('#gifPreview').style.display = '';
            showProgress('GIF généré avec succès !');
            showLoading(false);
            $('#convertBtn').disabled = false;
            $('#upload-section').style.display = '';
        });
        gif.on('error', function(err){
            $('#gifGenerationLoader').style.display = 'none';
            showProgress('Erreur lors de la conversion : '+err);
            showLoading(false);
            $('#convertBtn').disabled = false;
        });
        gif.render();
    });

    $('#uploadGif').addEventListener('click', async () => {
        if (!generatedGifBlob) {
            alert("Veuillez d'abord convertir un MP4 en GIF.");
            return;
        }
        $('#uploadResult').textContent = 'Téléchargement en cours...';
        $('#uploadGif').disabled = true;
        const formData = new FormData();
        formData.append('action', 'mp4togif_upload_ajax');
        formData.append('nonce', WPMP4TogifSettings.nonce);
        const filename = mp4File ? mp4File.name.replace(/\.mp4$/, '.gif') : 'converted.gif';
        formData.append('gif_file', generatedGifBlob, filename);

        try {
            const response = await fetch(WPMP4TogifSettings.ajaxurl, { method: 'POST', body: formData });
            const data = await response.json();
            if (data.success) {
                $('#uploadResult').innerHTML = 'GIF enregistré ! <a href="' + data.data.url + '" target="_blank">Voir le fichier</a>';
            } else {
                $('#uploadResult').textContent = "Erreur lors de l'enregistrement : " + data.data;
            }
        } catch (error) {
            $('#uploadResult').textContent = 'Erreur réseau : ' + error.message;
        } finally {
            $('#uploadGif').disabled = false;
        }
    });

    // Gestion onglets
    (function(){
        function activate_tab(tab) {
            document.querySelectorAll('.mp4togif-tab-nav a').forEach(a=>a.classList.remove('active'));
            document.querySelectorAll('.mp4togif-tab-panel').forEach(d=>d.classList.remove('active'));
            document.getElementById(tab).classList.add('active');
            var nav = document.getElementById('mp4togif-tab-'+tab.replace('mp4togif-',''));
            if (nav) nav.classList.add('active');
            window.localStorage.setItem('mp4togif_active_tab', tab);
        }
        var defaultTab = window.localStorage.getItem('mp4togif_active_tab') || 'mp4togif-convert';
        activate_tab(defaultTab);
        document.querySelectorAll('.mp4togif-tab-nav a').forEach(function(a){
            a.addEventListener('click', function(e){
                e.preventDefault();
                var tab = a.getAttribute('href').replace('#','');
                activate_tab(tab);
            });
        });
    })();
})();