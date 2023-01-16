const { CardFactory, MessageFactory } = require('botbuilder');

const settings = require('../appSettings');
const graphHelper = require('../helpers/graphHelper');

function authentication(step) {
    initializeGraph(settings); function initializeGraph(settings) {
        graphHelper.initializeGraphForUserAuth(settings, async (info) => {
        // Display the device code message to
        // the user. This tells them
        // where to go to sign in and provides the
        // code to use.
            console.log(info.message);
            const card = CardFactory.heroCard(
                'OAuth authentication',
                CardFactory.images(['https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg']),
                CardFactory.actions([
                    {
                        type: 'openUrl',
                        title: 'Go to Page',
                        value: 'https://microsoft.com/devicelogin'
                    }
                ])
            );
            const msg = MessageFactory.attachment(card);
            await step.context.sendActivity('Please enter the next code');
            await step.context.sendActivity(info.userCode);
            await step.context.sendActivity(msg);
        });
    }
}

module.exports.authentication = authentication;
