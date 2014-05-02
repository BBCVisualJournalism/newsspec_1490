define(['lib/news_special/bootstrap', 'lib/news_special/share_tools/controller'], function (news, shareTools) {

    return {
        init: function (storyPageUrl) {

            news.pubsub.emit('istats', ['App initiated', true]);

            shareTools.init('.main', {
                url:     storyPageUrl,
                header:  'Share this page',
                message: 'Custom message',
                hashtag: 'BBCNewsGraphics'
            });

            news.setIframeHeight(9999);

            news.hostPageSetup(function () {
                // console.log('do something in the host page');
            });

        }
    };

});