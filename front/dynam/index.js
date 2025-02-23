// Constants
const ROTATION_CONFIG = {
    RADIUS: 250,
    ANGLE_STEP: 120, // 360/3 pour un prisme à 3 faces
    OPACITY: {
        ACTIVE: 1,
        ADJACENT: 0.7,
        INACTIVE: 0.4
    }
};

// DOM Elements
const DOM = {
    games: document.querySelectorAll(".game-card"),
    menu: document.querySelector(".menu"),
    gameMenu: document.querySelector('#gameMenu'),
    content: document.getElementById('content'),
    navigationItems: document.querySelectorAll('.li')
};

// Navigation Controller
class NavigationController {
    static init() {
        DOM.navigationItems.forEach(item => {
            item.addEventListener('click', () => {
                this.setActiveNavItem(item);
                const section = item.getAttribute('data-section');
                SectionLoader.load(section);
            });
        });
    }

    static setActiveNavItem(activeItem) {
        DOM.navigationItems.forEach(nav => nav.classList.remove('active'));
        activeItem.classList.add('active');
    }
}

// Section Loader
class SectionLoader {
    static async load(section) {
        await this.loadHTML(section);
        await this.loadCSS(section);
        await this.loadJS(section);
    }

    static async loadHTML(section) {
        const response = await fetch(`./sections/${section}/${section}.html`);
        const html = await response.text();
        DOM.content.innerHTML = html;
    }

    static loadCSS(section) {
        const existingStyle = document.querySelector(`#style-${section}`);
        if (!existingStyle) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `./sections/${section}/${section}.css`;
            link.id = `style-${section}`;
            document.head.appendChild(link);
        }
    }

    static loadJS(section) {
        const script = document.createElement('script');
        script.src = `./sections/${section}/${section}.js`;
        script.type = 'module';
        document.body.appendChild(script);
    }
}

// Game Menu Controller
class GameMenuController {
    static selectedIndex = 0;

    static init() {
        this.setupEventListeners();
        this.updateRotation();
    }

    static setupEventListeners() {
        this.setupKeyboardControls();
        this.setupGameCardClicks();
    }

    static setupKeyboardControls() {
        document.addEventListener("keydown", (e) => {
            const keyActions = {
                'ArrowRight': () => this.rotateMenu(1),
                'ArrowLeft': () => this.rotateMenu(-1),
                'Enter': () => this.launchGame(),
                'Escape': () => this.closeMenu(),
                'm': () => this.toggleMenu(),
                'M': () => this.toggleMenu()
            };

            const action = keyActions[e.key];
            if (action) action();
        });
    }

    static setupGameCardClicks() {
        DOM.games.forEach(card => {
            card.addEventListener('click', () => {
                this.selectedIndex = parseInt(card.getAttribute('data-index'));
                this.updateRotation();
                this.launchGame();
            });
        });
    }

    static rotateMenu(direction) {
        const gamesLength = DOM.games.length;
        this.selectedIndex = (this.selectedIndex + direction + gamesLength) % gamesLength;
        this.updateRotation();
    }

    static updateRotation() {
        const baseAngle = this.selectedIndex * ROTATION_CONFIG.ANGLE_STEP;
        const normalizedAngle = ((baseAngle % 360) + 360) % 360;
        
        DOM.menu.style.transform = `translateX(-50%)`;
        
        DOM.games.forEach((game, i) => {
            this.updateGameCardPosition(game, i, normalizedAngle);
        });
    }

    static updateGameCardPosition(game, index, normalizedAngle) {
        const faceAngle = index * ROTATION_CONFIG.ANGLE_STEP - normalizedAngle;
        
        game.style.transform = `
            translateX(-50%)
            rotateY(${faceAngle}deg)
            translateZ(${ROTATION_CONFIG.RADIUS}px)
            translateX(50%)
        `;
        
        this.updateGameCardVisibility(game, index);
    }

    static updateGameCardVisibility(game, index) {
        const isActive = index === this.selectedIndex % DOM.games.length;
        game.classList.toggle('active', isActive);
        
        const angleDiff = Math.abs((index - this.selectedIndex + DOM.games.length) % DOM.games.length);
        game.style.opacity = isActive ? ROTATION_CONFIG.OPACITY.ACTIVE :
                            angleDiff === 1 ? ROTATION_CONFIG.OPACITY.ADJACENT :
                            ROTATION_CONFIG.OPACITY.INACTIVE;
    }

    static launchGame() {
        const activeGame = document.querySelector('.game-card.active');
        if (activeGame) {
            const section = activeGame.getAttribute('data-section');
            NavigationController.setActiveNavItem(
                document.querySelector(`[data-section="${section}"]`)
            );
            SectionLoader.load(section);
            this.closeMenu();
        }
    }

    static closeMenu() {
        DOM.gameMenu.classList.remove('open');
    }

    static toggleMenu() {
        DOM.gameMenu.classList.toggle('open');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    NavigationController.init();
    GameMenuController.init();
});

