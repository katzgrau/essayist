$(function() {

    $.adnag = function(options) {
        
        /* Some housework */
        var self = this;
        if(!options) options = {};
        
        /* options */
        self.options = {
            /* Enable console logging */
            logging:    options.logging     || false,
            /* Set the widget title */
            title:      options.title       || 'Hide/Show Advertisement',
            /* Set the short blurb in the adnag box */
            summary:    options.summary     || "Your detailed adnag is very appreciated!",
            /* The lbael of the text area in the adnag box */
            fieldTitle: options.fieldTitle  || 'Your comments:',
            /* Whether the widget should be open be default */
            startOpen:  options.startOpen   || false,
            /* The brief message to display when the adnag is sent (sits in the title) */
            thankYou:   options.thankYou    || 'Thank You!'
        };

        self.root = null;
        
        /** 
         * Attach required handlers to make this thing work 
         */
        self.attachHandlers = function() {
            jQuery('[data-adnag-link]').click(self.toggleVisibility);
            self.root.find('.adnag-title').click(self.toggleVisibility);
        };

        /**
         * Write the DOm and do any other housework 
         */
        self.init = function() {

            self.log('Initializing adnag widget');

            self.root = jQuery('#adnag-root');
            self.root.find('.adnag-title-text').text(self.options.title);

            if(self.options.startOpen) {
                self.root.removeClass('adnag-closed');
                self.root.find('.caret').html('&#9660;');
            }
            
            $('body').append(self.root);
            
            self.log('Attaching handlers');
            self.attachHandlers();
            
            self.log('Initializing complete');
        };
        
        /**
        * Log a message to the console
        */
        self.log = function(message) {

            if(self.options.logging && window.console && console.log) {
                console.log('adnag: ' + message);
            }

        };

        /**
         * An event handler/method that will toggle the vii=sibility of the
         *  adnag box
         */
        self.toggleVisibility = function(e) {
            
            if(e) {
                e.preventDefault();
                target = jQuery(e.target);
            }
            
            self.root.toggleClass('adnag-closed');
            
            if(self.root.hasClass('adnag-closed')) {
                self.root.find('[name="ref"]').val('');
                self.root.find('.caret').html('&#9650;');
            } else {
                if(target) self.root.find('[name="ref"]').val(target.attr('data-adnag-link'));
                self.root.find('.caret').html('&#9660;');
            }
        };
        
        /* All systems go */
        self.init();
    };

    $.adnag({
        startOpen: true
    });
});
