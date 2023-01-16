// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { AttachmentLayoutTypes, CardFactory, MessageFactory } = require('botbuilder');
const { ChoicePrompt, ChoiceFactory, ListStyle, ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt } = require('botbuilder-dialogs');
// const readline = require('readline-sync');

const authGraph = require('../helpers/authGraph');
const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';
const TEXT_PROMPT = 'TEXT_PROMPT';

const getUserInfoHelper = require('../helpers/getUserInfoHelper');

class MainDialog extends ComponentDialog {
    constructor() {
        super('MainDialog');

        // Define the main dialog and its related components.
        this.addDialog(new ChoicePrompt('cardPrompt'));
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
            this.choiceCardStep.bind(this),
            this.showCardStep.bind(this)
        ]));

        // The initial child Dialog to run.
        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    /**
     * 1. Prompts the user if the user is not in the middle of a dialog.
     * 2. Re-prompts the user when an invalid input is received.
     *
     * @param {WaterfallStepContext} stepContext
     */
    async choiceCardStep(stepContext) {
        console.log('MainDialog.choiceCardStep');

        // Create the PromptOptions which contain the prompt and re-prompt messages.
        // PromptOptions also contains the list of choices available to the user.
        const options = {
            prompt: 'What service would you like to try?',
            retryPrompt: 'That was not a valid choice',
            // choices: this.getChoices()
            choices: ChoiceFactory.toChoices(
                [
                    'My Info Graph',
                    'Cognitive Services',
                    'AI',
                    'Translate',
                    'LUIS',
                    'QNA',
                    'Bloob',
                    'Azure',
                    'Otro'
                ]
            ),
            style: ListStyle.buttons

        };

        // Prompt the user with the configured PromptOptions.
        return await stepContext.prompt('cardPrompt', options);
    }

    /**
     * Send a Rich Card response to the user based on their choice.
     * This method is only called when a valid prompt response is parsed from the user's response to the ChoicePrompt.
     * @param {WaterfallStepContext} stepContext
     */
    async showCardStep(stepContext) {
        console.log('MainDialog.showCardStep');

        switch (stepContext.result.value) {
        // case 'Adaptive Card':
        //     await stepContext.context.sendActivity({ attachments: [this.createAdaptiveCard()] });
        //     break;
        case 'My Info Graph':
            await this.getMyInfo(stepContext);
            break;
        case 'Cognitive Services':
            await stepContext.context.sendActivity('Cognitive Services');
            break;
        default:
            await stepContext.context.sendActivity('a');
            break;
        }

        // Con esto se inicia nuevamente el main dialog
        return await stepContext.replaceDialog(MAIN_WATERFALL_DIALOG);
        // // return await stepContext.endDialog();
    }

    // ======================================
    // Helper functions
    // ======================================
    async getMyInfo(step) {
        // Initialize Graph
        await authGraph.authentication(step);
        // Get usr info
        await getUserInfoHelper.getUserInfoHelper(step);
    }
}

module.exports.MainDialog = MainDialog;
