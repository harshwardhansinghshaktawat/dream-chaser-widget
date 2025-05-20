class DreamChaser extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.elements = [];
    this.isVisible = false;
    this.observer = null;
  }

  static get observedAttributes() {
    return [
      'text', 'heading-tag', 'font-size', 'font-family', 'font-color', 
      'text-alignment', 'background-color', 'animation-speed', 
      'animation-distance', 'animation-fade-distance'
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  connectedCallback() {
    this.render();
    this.handleResize = () => this.render();
    window.addEventListener('resize', this.handleResize);
    this.handleScroll = () => {
      if (this.isVisible) {
        this.animateText();
      }
    };
    window.addEventListener('scroll', this.handleScroll);
    
    // Set up Intersection Observer to detect when element enters viewport
    this.setupIntersectionObserver();
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('scroll', this.handleScroll);
    
    // Clean up the observer
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  setupIntersectionObserver() {
    // Create observer with options
    const options = {
      root: null, // Use viewport as root
      rootMargin: '0px',
      threshold: 0.1 // Trigger when at least 10% of the element is visible
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Update visibility state
        this.isVisible = entry.isIntersecting;
        
        // If element just became visible, start animation
        if (this.isVisible) {
          this.animateText();
        } else {
          // Reset animation when not visible
          this.resetAnimation();
        }
      });
    }, options);

    // Start observing the element
    this.observer.observe(this);
  }

  resetAnimation() {
    // Reset all elements to their initial state
    this.elements.forEach((element) => {
      element.style.transform = 'translate3d(0, 0, 0)';
      element.style.opacity = 1;
    });
  }

  move(element, distance) {
    const translate3d = `translate3d(0, ${distance}px, 0)`;
    element.style.transform = translate3d;
  }

  fadeOut(element, scrollDistance, fadeDistance) {
    element.style.opacity = Math.max(0, (fadeDistance - scrollDistance) / fadeDistance);
  }

  animateText() {
    // Only animate if element is visible
    if (!this.isVisible) return;
    
    const elementRect = this.getBoundingClientRect();
    const elementTop = elementRect.top;
    const viewportHeight = window.innerHeight;
    
    // Calculate how far the element is from the top of the viewport
    // Normalized to start at 0 when element enters viewport
    const effectiveScrollDistance = Math.max(0, -elementTop);
    
    const animationSpeed = parseFloat(this.getAttribute('animation-speed')) || 2;
    const animationDistance = parseFloat(this.getAttribute('animation-distance')) || 300;
    const animationFadeDistance = parseFloat(this.getAttribute('animation-fade-distance')) || 200;

    this.elements.forEach((element) => {
      const movement = -(effectiveScrollDistance * element.dataset.speed * animationSpeed);
      this.move(element, movement);
      this.fadeOut(element, effectiveScrollDistance, animationFadeDistance);
    });
  }

  render() {
    const text = this.getAttribute('text') || 'Dream Chaser';
    const headingTag = this.getAttribute('heading-tag') || 'h1';
    const fontSize = parseFloat(this.getAttribute('font-size')) || 4; // In vw
    const fontFamily = this.getAttribute('font-family') || 'Roboto';
    const fontColor = this.getAttribute('font-color') || '#E9C46A'; // Golden
    const textAlignment = this.getAttribute('text-alignment') || 'center';
    const backgroundColor = this.getAttribute('background-color') || '#0A3D62'; // Dark teal

    // Clear previous elements
    this.elements = [];

    // Split text into letters, preserving spaces
    const letters = text.split('');

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css?family=Roboto:400,700');

        :host {
          width: 100vw;
          height: 100vh;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${backgroundColor};
          overflow: hidden;
        }

        .container {
          text-align: ${textAlignment};
          max-width: 80vw;
        }

        .headline {
          margin: 0;
          font-family: ${fontFamily}, sans-serif;
          font-weight: 700;
          color: ${fontColor};
          text-transform: uppercase;
          font-size: ${fontSize}vw;
          display: inline-block;
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: normal;
          line-height: 1.2;
        }

        .letter {
          display: inline-block;
          padding: 0 5px;
          transition: transform 0.3s ease, opacity 0.3s ease;
          opacity: 1; /* Start visible */
        }
      </style>
      <div class="container">
        <${headingTag} class="headline"></${headingTag}>
      </div>
    `;

    const headline = this.shadowRoot.querySelector('.headline');
    headline.innerHTML = ''; // Clear any previous content
    letters.forEach((letter) => {
      const element = document.createElement('span');
      element.classList.add('letter');
      element.innerText = letter;
      element.dataset.speed = letter === ' ' ? 0 : Math.random().toFixed(2); // Spaces don't move
      headline.appendChild(element);
      this.elements.push(element);
    });

    // If we already have an observer, disconnect and reconnect
    if (this.observer) {
      this.observer.disconnect();
      this.setupIntersectionObserver();
    }
  }
}

customElements.define('dream-chaser', DreamChaser);
