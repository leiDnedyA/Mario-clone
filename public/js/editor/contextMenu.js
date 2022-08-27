
class ContextButton {
    /**
     * 
     * @param {string} label 
     * @param {*} conditionCallback returns false if button should be disabled and true if enabled.
     * @param {*} callback 
     */
    constructor(label = "Sample Button", conditionCallback, callback) {
        this.label = label;
        this.conditionCallback = conditionCallback;
        this.callback = callback;

        this.targetData = null;
        this.isDisabled = true;

        this.domElement = document.createElement('div');
        this.domElement.innerHTML = this.label;
        this.domElement.classList.add('item', 'disabled');
        this.domElement.addEventListener('click', ()=>{this.handleClick()});

    }

    handleClick() {
        if (!this.isDisabled) {
            this.callback(this.targetData);
        }
    }

    setDisabled(isDisabled) {
        if(this.isDisabled !== isDisabled){
            this.isDisabled = isDisabled;
            if(this.isDisabled && !this.domElement.classList.contains('disabled')){
                this.domElement.classList.add('disabled')
            }else if(!this.isDisabled && this.domElement.classList.contains('disabled')){
                this.domElement.classList.remove('disabled');
            }else{
                console.log(`WARNING: redundant setDisabled() called on button "${this.label}". Argument passed: "${isDisabled}"`);
            }
        }
    }

    loadTarget(targetData) {
        this.targetData = targetData;
        this.setDisabled(!this.conditionCallback(this.targetData));
    }


}

//planned buttons: Edit, Delete, Copy, Paste

const contextMenu = {

    domElement: document.querySelector('#contextMenu'),

    isHidden: true,

    buttons: [],

    currentTargetData: {},

    show: function (position, targetData) {

        this.currentTargetData = targetData;

        for(let i in this.buttons){
            this.buttons[i].loadTarget(this.currentTargetData);
        }
        
        this.domElement.style.visibility = "visible";
        this.domElement.style.left = `${position[0]}px`;
        this.domElement.style.top = `${position[1]}px`;
        this.isHidden = false;
    },

    hide: function () {
        this.domElement.style.visibility = "hidden";
        this.isHidden = true;
    },

    init: function (buttons = []) {
        this.buttons = buttons;
        for(let i in this.buttons){
            this.domElement.appendChild(this.buttons[i].domElement);
        }
    }

}
