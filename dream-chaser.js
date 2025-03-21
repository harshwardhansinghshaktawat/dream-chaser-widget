class DreamChaser extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.elements = [];
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
    this.handleScroll = () => this.animateText();
    window.addEventListener('scroll', this.handleScroll);
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('scroll', this.handleScroll);
  }

  move(element, distance) {
    const translate3d = `translate3d(0, ${distance}px, 0)`;
    element.style.transform = translate3d;
  }

  fadeOut(element, scrollDistance, fadeDistance) {
    element.style.opacity = Math.max(0, (fadeDistance - scrollDistance) / fadeDistance);
  }

  animateText() {
    const topDistance = window.pageYOffset;
    const animationSpeed = parseFloat(this.getAttribute('animation-speed')) || 2;
    const animationDistance = parseFloat(this.getAttribute('animation-distance')) || 300;
    const animationFadeDistance = parseFloat(this.getAttribute('animation-fade-distance')) || 200;

    this.elements.forEach((element) => {
      const movement = -(topDistance * element.dataset.speed * animationSpeed);
      this.move(element, movement);
      this.fadeOut(element, topDistance, animationDistance);
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
    const animationSpeed = parseFloat(this.getAttribute('animation-speed')) || 2;
    const animationDistance = parseFloat(this.getAttribute('animation-distance')) || 300;
    const animationFadeDistance = parseFloat(this.getAttribute('animation-fade-distance')) || 200;

    // Clear previous elements
    this.elements = [];

    // Split text into letters, filter out spaces and newlines
    const letters = text.split('').filter(letter => letter !== ' ' && letter !== '\n');

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
          opacity: 0;
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
          transition: transform 0.1s ease, opacity 0.1s ease;
        }
      </style>
      <div class="container">
        <${headingTag} class="headline"></${headingTag}>
      </div>
    `;

    const headline = this.shadowRoot.querySelector('.headline');
    letters.forEach((letter) => {
      const element = document.createElement('span');
      element.classList.add('letter');
      element.innerText = letter;
      element.dataset.speed = Math.random().toFixed(2); // Random speed between 0 and 1
      headline.appendChild(element);
      this.elements.push(element);
    });

    // Trigger initial animation
    this.animateText();
  }
}

customElements.define('dream-chaser', DreamChaser);
