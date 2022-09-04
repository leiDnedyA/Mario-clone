
const menuManager = {
    levelElements: {},

    levelElementsDiv: document.querySelector('#levelElements'),
    
    addElement: function(menuElement){
        console.log(menuElement)
        this.levelElements[menuElement.label] = menuElement;
        this.levelElementsDiv.appendChild(menuElement.domElement);
    },

    removeElement: function(key){
        this.levelElements[key].remove();
        delete this.levelElements[key];
    },
}

class MenuElement {
    constructor(label, referenceObj, type, buttonCallback){
        this.label = label;
        this.referenceObj = referenceObj;
        this.type = type;
        this.buttonCallback = buttonCallback;
        
        this.domElement = document.createElement('div');
        this.domElement.classList.add('menuLevelElement');
        
        let labelElement = document.createElement('p');
        labelElement.innerHTML = this.label + '';
        
        let buttonElement = document.createElement('button');
        buttonElement.innerHTML = 'select';
        buttonElement.addEventListener('click', this.buttonCallback);
        buttonElement.classList.add('coolButton');
        
        this.domElement.appendChild(labelElement);
        this.domElement.appendChild(buttonElement);
    }

    remove(){
        this.domElement.remove();
    }

}


let testElement = new MenuElement('test element', {}, 'boundsObj', ()=>{alert('test element button pressed.')});;

menuManager.addElement(testElement)