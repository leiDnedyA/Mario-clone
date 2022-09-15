
const destinationPopupController = {

    windowObj: null,

    broadcastChannel: new BroadcastChannel('destinationPopup'),

    close: function () {
        if (!this.windowObj.closed) {
            this.windowObj.close();
        }
    },
    open: function () {

        let loadContents = () => {
            this.broadcastChannel.postMessage(420);            
        }

        if (this.windowObj === null || this.windowObj.closed) {
            this.windowObj = window.open('destination_popup.html', 'doorLocationSelector', 'popup,width=500,height=500');
            this.windowObj.onload = _=>{
                loadContents();
            }
            
        } else {
            this.windowObj.focus();
            loadContents();
        }


    },

}