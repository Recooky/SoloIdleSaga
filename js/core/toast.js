let toastContainer = null;

function ensureToastContainer() {
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 100000;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            pointer-events: none;
        `;
        document.body.appendChild(toastContainer);
    }
    return toastContainer;
}

window.showToast = function(message, duration = 2000) {
    const container = ensureToastContainer();
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        padding: 10px 24px;
        border-radius: 10px;
            1. inset 0 3px 0 rgba(255, 255, 255, 0.8):
            2. 0 8px 16px rgba(123, 92, 77, 0.15): 
        box-shadow:
            inset 0 3px 0 rgba(255, 255, 255, 0.8),
            0 8px 16px rgba(123, 92, 77, 0.15);
        font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
        font-size: 14px;
        font-weight: 600;
        border: 1px solid #334155;
        box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        opacity: 1;
        transition: opacity 0.5s ease;
        pointer-events: auto;
        text-align: center;
        max-width: 80vw;
        white-space: nowrap;

        background-color: #fdf4e9; 
        border: 3px solid #7B5C4D;     
        animation: toastSlideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        
 
        color: #5D4037; 
        letter-spacing: 1px;

        @keyframes toastSlideDown {
        0% {
            top: 0px;
            opacity: 0;
            transform: translateX(-50%) scale(0.8);
        }
        100% {
            top: 40px;
            opacity: 1;
            transform: translateX(-50%) scale(1);
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 500);
    }, duration);
};