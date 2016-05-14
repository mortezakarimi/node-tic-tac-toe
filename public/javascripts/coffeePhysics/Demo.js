var Demo, __bind = function (fn, me) {
    return function () {
        return fn.apply(me, arguments);
    };
};
Demo = (function () {
    Demo.COLOURS = ['2e3136', 'a64242', '4467a7', 'ff5955', '5ea8ff'];
    var bounds;
    var attraction;
    var mouseIn = false;

    function Demo() {
        this.mousemove = __bind(this.mousemove, this);
        this.resize = __bind(this.resize, this);
        this.physics = new Physics();
        this.mouse = new Particle();
        this.mouse.fixed = true;
        this.renderTime = 0;
        this.counter = 0;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        min = new Vector(0.0, 0.0);
        max = new Vector(this.width, this.height);
        bounds = new EdgeBounce(min, max);
    }

    Demo.prototype.setup = function (full) {
        var collide, repulsion, i, max, min, p, _i, _results;
        if (full == null) {
            full = true;
        }
        this.physics.integrator = new Verlet();
        attraction = new Attraction(this.mouse.pos, 300, 1200);
        repulsion = new Attraction(this.mouse.pos, 200, -2000);
        collide = new Collision();
        _results = [];
        for (i = _i = 0; _i <= 200; i = ++_i) {
            p = new Particle(Random(0.8, 6.5));
            p.colour = Random.item(Demo.COLOURS);
            p.setRadius(p.mass * 5);
            p.moveTo(new Vector(Random(this.width), Random(this.height)));
            p.behaviours.push(new Wander(0.8, 300, Random(0.8, 2)));
            p.behaviours.push(attraction);
            p.behaviours.push(repulsion);
            p.behaviours.push(bounds);
            p.behaviours.push(collide);
            collide.pool.push(p);
            _results.push(this.physics.particles.push(p));
        }
        return _results;
    };
    Demo.prototype.init = function (container, renderer) {
        this.container = container;
        this.renderer = renderer != null ? renderer : new WebGLRenderer();
        this.renderer.renderMouse = false;
        this.setup(renderer.gl != null);
        document.addEventListener('touchmove', this.mousemove, false);
        document.addEventListener('mousemove', this.mousemove, false);
        document.addEventListener('resize', this.resize, false);
        $(document).resize(this.resize);
        document.addEventListener('click', this.click, false);
        this.container.appendChild(this.renderer.domElement);
        this.renderer.mouse = this.mouse;
        this.renderer.init(this.physics);
        return this.resize();
    };
    var clickTimeout = false;
    Demo.prototype.click = function (event) {
        if (mouseIn) {
            if (clickTimeout != false) {
                clearTimeout(clickTimeout);
                clickTimeout = false;
            }
            attraction.strength = -16000;
            attraction.setRadius(3000);
            clickTimeout = setTimeout(function () {
                attraction.strength = 1200;
                attraction.setRadius(500);
                clickTimeout = false;
            }, 300);
        }
    };
    Demo.prototype.resize = function (event) {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        bounds.max.set(this.width, this.height);
        return this.renderer.setSize(this.width, this.height);
    };
    Demo.prototype.mousemove = function (event) {
        var touch, x, y;
        event.preventDefault();
        if (event.touches && !!event.touches.length) {
            touch = event.touches[0];
            x = touch.pageX - jQuery(this.container).offset().left;
            y = touch.pageX - jQuery(this.container).offset().top;
        } else {
            x = event.pageX - jQuery(this.container).offset().left;
            y = event.pageY - jQuery(this.container).offset().top;
        }
        if (x < 1 || y < 1 || x >= this.width || y >= this.height) {
            x = -1;
            y = -1;
            mouseIn = false;
        } else {
            mouseIn = true;
        }
        return this.mouse.pos.set(x, y);
    };
    Demo.prototype.step = function () {
        this.physics.step();
        if ((this.renderer.gl != null) || ++this.counter % 3 === 0) {
            return this.renderer.render(this.physics);
        }
    };
    Demo.prototype.destroy = function () {
        var error;
        document.removeEventListener('touchmove', this.mousemove, false);
        document.removeEventListener('mousemove', this.mousemove, false);
        document.removeEventListener('resize', this.resize, false);
        try {
            container.removeChild(this.renderer.domElement);
        } catch (_error) {
            error = _error;
        }
        this.renderer.destroy();
        this.physics.destroy();
        this.renderer = null;
        this.physics = null;
        return this.mouse = null;
    };
    return Demo;
})();
