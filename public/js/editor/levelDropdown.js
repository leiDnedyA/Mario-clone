
const levelDropdown = {
    domElement: document.querySelector('#loadedLevelDropdown'),

    currentIndex: 0,

    optionsList: [],
    
    getCurrentIndex: function(){
        return parseInt(this.currentIndex);
    },

    setCurrentIndex: function(index){
        this.currentIndex = parseInt(index);
        domElement.selectedIndex = this.currentIndex;
    },

    /**
     * Sets the list of options in the levelDropdown DOM element
     * 
     * @param {[string]} newList labels for each option in the dropdown 
     */
    setOptionsList: function(newList){
        this.optionsList = newList;

        this.domElement.innerHTML = '';

        for(let i in this.optionsList){
            let optionElement = document.createElement('option');
            optionElement.innerHTML = this.optionsList[i];
            this.domElement.appendChild(optionElement);
        }

    },

    onclickCallback: null,
    
    init: function(onclickCallback){
        this.onclickCallback = onclickCallback;

        this.domElement.addEventListener('click', ()=>{
            this.currentIndex = this.domElement.selectedIndex;
            this.onclickCallback();
        });
        
    },

}