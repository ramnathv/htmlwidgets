/** Defines a minimal widget. */
HTMLWidgets.widget({
    name: "mockwidget",    
    type: "output",
    
    factory: function(el, width, height) {
        window.document.createElement('svg');
        const template = document.createElement('template');
        template.innerHTML = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="lightblue"/><text x="20" y="35" class="xtext">(no value)</text></svg>`;
        const svg = template.content.firstChild;
        const xtext = svg.querySelector('.xtext');
        el.appendChild(svg);

        return {
            renderValue: function(x) {
                xtext.textContent = x.toString();
            },
            
            resize: function(width, height) {
                svg.setAttribute('viewBox',  `0 0 ${width} ${height}`);
            }
        };
    }
  });
