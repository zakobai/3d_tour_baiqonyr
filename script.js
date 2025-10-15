// script.js
// Требует GSAP + ScrollTrigger (подключены в index.html)

(function(){
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  function lazyLoadVideo(video) {
    if (!video) return;
    const source = video.querySelector('source[data-src]');
    if (source && !source.src) {
      source.src = source.getAttribute('data-src');
      try { video.load(); } catch(e){}
    }
  }

  const blocks = document.querySelectorAll('.video-block');
  blocks.forEach(block => {
    const video = block.querySelector('.stage-video');

    ScrollTrigger.create({
      trigger: block,
      start: 'top 80%',
      end: 'bottom 20%',
      onEnter: () => {
        lazyLoadVideo(video);
        video.style.opacity = '1';
        video.style.transform = 'scale(1) translateY(0)';
        video.muted = true;
        video.play().catch(()=>{});
      },
      onEnterBack: () => {
        lazyLoadVideo(video);
        video.style.opacity = '1';
        video.style.transform = 'scale(1) translateY(0)';
        video.muted = true;
        video.play().catch(()=>{});
      },
      onLeave: () => {
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

    const btn = block.querySelector('.sound-toggle');
    if (btn) {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        if (video.muted) {
          video.muted = false;
          btn.setAttribute('data-sound','on');
          video.play().catch(()=>{});
        } else {
          video.muted = true;
          btn.removeAttribute('data-sound');
        }
      });
    }

    video.addEventListener('click', () => {
      video.muted = !video.muted;
      if (!video.muted && block.querySelector('.sound-toggle')) {
        block.querySelector('.sound-toggle').setAttribute('data-sound', 'on');
      } else if (block.querySelector('.sound-toggle')) {
        block.querySelector('.sound-toggle').removeAttribute('data-sound');
      }
    });
  });

  // Optional: keyboard toggle
  window.addEventListener('keydown', e => {
    if (e.code === 'Space') {
      e.preventDefault();
      const found = Array.from(document.querySelectorAll('.video-block')).find(b => {
        const r = b.getBoundingClientRect();
        return r.top < window.innerHeight*0.5 && r.bottom > window.innerHeight*0.25;
      });
      if (found) {
        const v = found.querySelector('.stage-video');
        if (v.paused) v.play().catch(()=>{});
        else v.pause();
      }
    }
  });

})();