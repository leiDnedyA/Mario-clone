
const contextMenu = {
    
    domElement: document.querySelector('#contextMenu'),

    isHidden: true,

    show: function(position){
        this.domElement.style.visibility = "visible";
        this.domElement.style.left = `${position[0]}px`;
        this.domElement.style.top = `${position[1]}px`;
        this.isHidden = false;
    },

    hide: function(){
        this.domElement.style.visibility = "hidden";
        this.isHidden = true;
    },

}