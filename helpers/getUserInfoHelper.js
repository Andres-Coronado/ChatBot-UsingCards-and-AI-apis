
const { MessageFactory } = require('botbuilder');

const graphHelper = require('./graphHelper');
const myInfoCard = require('../resources/myInfoCard');
async function getUserInfoHelper(step) {
    try {
        const user = await graphHelper.getUserAsync();
        // For Work/school accounts, email is in mail property
        // Personal accounts, email is in userPrincipalName
        // Sending info to make an adaptive card  with this func getInfoCard
        const card = await myInfoCard.getInfoCard(user);
        const message = MessageFactory.attachment(card);
        await step.context.sendActivity(message);
    } catch (err) {
        console.log(`Error getting user: ${ err }`);
    }
}

module.exports.getUserInfoHelper = getUserInfoHelper;
