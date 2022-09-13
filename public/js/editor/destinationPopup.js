
const destinationPopupController = {

    windowObj : null,

    close: function () {
        if(!this.windowObj.closed){
            this.windowObj.close();
        }
    },
    open: function () {

        if(this.windowObj === null || this.windowObj.closed){
            this.windowObj = window.open('/destination_popup.html', 'doorLocationSelector', 'popup,width=500,height=500');
        }else{
            this.windowObj.focus();
        }

        


    },

}