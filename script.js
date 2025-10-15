// script.js
// Требует GSAP + ScrollTrigger (подключены в index.html)

(function(){
  var data = window.APP_DATA;
  // регистрируем ScrollTrigger
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // helper: lazy load source from data-src
  function lazyLoadVideo(video) {
    if (!video) return;
    const source = video.querySelector('source[data-src]');
    if (source && !source.src) {
      source.src = source.getAttribute('data-src');
      // загрузим метаданные
      try { video.load(); } catch(e) {}
    }
  }

  // Для каждого блока: настройка ScrollTrigger и поведение play/pause
  const blocks = document.querySelectorAll('.video-block');
  blocks.forEach((block, idx) => {
    const video = block.querySelector('.stage-video');

    // ========== ScrollTrigger: плавное появление видео ==========
    ScrollTrigger.create({
      trigger: block,
      start: 'top 80%',
      end: 'bottom 20%',
      onEnter: () => {
        // lazy load
        lazyLoadVideo(video);

        // показать и начать (muted must be true for autoplay)
        video.style.opacity = '1';
        video.style.transform = 'scale(1) translateY(0)';
        // play, но убедимся что видео готово
        const tryPlay = () => {
          // muted autoplay
          video.muted = true;
          const p = video.play();
          if (p && typeof p.then === 'function') {
            p.catch(()=>{/* play might be blocked until user interacts */});
          }
        };
        tryPlay();
      },
      onEnterBack: () => {
        lazyLoadVideo(video);
        video.style.opacity = '1';
        video.style.transform = 'scale(1) translateY(0)';
        video.muted = true;
        video.play().catch(()=>{});
      },
      onLeave: () => {
        // fade out & pause
        video.style.opacity = '0';
        video.style.transform = 'scale(1.03) translateY(20px)';
        try { video.pause(); } catch(e){}
      },
      onLeaveBack: () => {
        video.style.opacity = '0';
        video.style.transform = 'scale(1.03) translateY(20px)';
        try { video.pause(); } catch(e){}
      }
    });

    // ========== Sound toggle ==========
    const btn = block.querySelector('.sound-toggle');
    if (btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        // если звук выключен — включаем и делаем unmuted; если он выключен — выключаем
        if (video.muted) {
          video.muted = false;
          btn.setAttribute('data-sound', 'on');
          // чтобы звук заработал, браузер требует взаимодействия, поэтому play точно сработает
          video.play().catch(()=>{});
        } else {
          video.muted = true;
          btn.removeAttribute('data-sound');
          // не обязательно ставить на паузу
        }
      });
    }

    // Make sure when user taps video directly we toggle mute as well (mobile friendly)
    video.addEventListener('click', () => {
      // single click toggles mute
      video.muted = !video.muted;
      if (!video.muted && block.querySelector('.sound-toggle')) {
        block.querySelector('.sound-toggle').setAttribute('data-sound', 'on');
      } else if (block.querySelector('.sound-toggle')) {
        block.querySelector('.sound-toggle').removeAttribute('data-sound');
      }
    });

    // Optionally preload poster only, video will be loaded when entering
  });


 // Создаём viewer
var viewer = new Marzipano.Viewer(document.getElementById('pano'));

// Для каждой сцены из data.js создаём объект
var scenes = data.scenes.map(function(sceneData) {
  var urlPrefix = "tiles";
  var source = Marzipano.ImageUrlSource.fromString(
    urlPrefix + "/" + sceneData.id + "/{z}/{f}/{y}/{x}.jpg",
    { cubeMapPreviewUrl: urlPrefix + "/" + sceneData.id + "/preview.jpg" }
  );
  var geometry = new Marzipano.CubeGeometry(sceneData.levels);
  var limiter = Marzipano.RectilinearView.limit.traditional(
    sceneData.faceSize, 120 * Math.PI / 180
  );
  var view = new Marzipano.RectilinearView(
    sceneData.initialViewParameters, limiter
  );
  var scene = viewer.createScene({
    source: source,
    geometry: geometry,
    view: view
  });
  return scene;
});

// Показываем первую сцену
scenes[0].switchTo();

  // Optional: keyboard navigation (space = toggle current visible video play/pause)
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      // find the first block mostly in viewport
      const found = Array.from(document.querySelectorAll('.video-block')).find(b => {
        const r = b.getBoundingClientRect();
        return r.top < window.innerHeight * 0.5 && r.bottom > window.innerHeight * 0.25;
      });
      if (found) {
        const v = found.querySelector('.stage-video');
        if (v.paused) v.play().catch(()=>{});
        else v.pause();
      }
    }
  });
})();