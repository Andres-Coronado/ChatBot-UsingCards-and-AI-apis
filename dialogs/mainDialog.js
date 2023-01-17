// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ChoicePrompt, ChoiceFactory, ListStyle, ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt } = require('botbuilder-dialogs');
// const readline = require('readline-sync');

const authGraph = require('../helpers/authGraph');
const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';
const TEXT_PROMPT = 'TEXT_PROMPT';
const COGNITIVE_SERVICES = 'COGNITIVE_SERVICES';
const COGNITIVE_SERVICES_API = 'COGNITIVE_SERVICES_API';
const getUserInfoHelper = require('../helpers/getUserInfoHelper');
const CHOICE_PROMPT = 'CHOICE_PROMPT';

class MainDialog extends ComponentDialog {
    constructor() {
        super('MainDialog');

        // Define the main dialog and its related components.
        this.addDialog(new ChoicePrompt('CHOICE_PROMPT'));
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
            this.choiceCardStep.bind(this),
            this.showCardStep.bind(this)
        ]));
        this.addDialog(new WaterfallDialog(COGNITIVE_SERVICES, [
            this.choiceCognitiveService.bind(this),
            this.userServiceSelected.bind(this)
            // this.comsumeApi.bind(this)
        ]));

        this.addDialog(new WaterfallDialog(COGNITIVE_SERVICES_API, [
            this.useApiService.bind(this),
            this.comsumeApi.bind(this)
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
                    'Otro'
                ]
            ),
            style: ListStyle.buttons

        };

        // Prompt the user with the configured PromptOptions.
        return await stepContext.prompt('CHOICE_PROMPT', options);
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
            await stepContext.endDialog();
            return await stepContext.replaceDialog(COGNITIVE_SERVICES);
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

    // Cognitive Services
    async choiceCognitiveService(stepContext) {
        console.log('COGNITIVE_SERVICES.choiceCognitiveServices');

        // Create the PromptOptions which contain the prompt and re-prompt messages.
        // PromptOptions also contains the list of choices available to the user.
        const options = {
            prompt: 'What cognitive services would you like to try?',
            retryPrompt: 'That was not a valid choice',
            // choices: this.getChoices()
            choices: ChoiceFactory.toChoices(
                [
                    'EntityLinking',
                    'EntityRecognition',
                    'KeyPhraseExtraction',
                    'LanguageDetection',
                    'PiiEntityRecognition',
                    'SentimentAnalysis',
                    'Otro'
                ]
            ),
            style: ListStyle.buttons

        };

        // Prompt the user with the configured PromptOptions.
        return await stepContext.prompt('CHOICE_PROMPT', options);
    }

    async userServiceSelected(step) {
        console.log('COGNITIVE_SERVICES.userServiceSelected');

        switch (step.result.value) {
        case 'EntityLinking':
            await step.endDialog();
            return await step.replaceDialog('COGNITIVE_SERVICES_API', step.result.value);
        case 'EntityRecognition':
            await step.endDialog();
            return await step.replaceDialog('COGNITIVE_SERVICES_API', step.result.value);
        case 'KeyPhraseExtraction':
            await step.endDialog();
            return await step.replaceDialog('COGNITIVE_SERVICES_API', step.result.value);
        case 'LanguageDetection':
            await step.endDialog();
            return await step.replaceDialog('COGNITIVE_SERVICES_API', step.result.value);
        case 'PiiEntityRecognition':
            await step.endDialog();
            return await step.replaceDialog('COGNITIVE_SERVICES_API', step.result.value);
        case 'SentimentAnalysis':
            await step.endDialog();
            return await step.replaceDialog('COGNITIVE_SERVICES_API', step.result.value);

        default:
            await step.context.sendActivity('a');

            break;
        }
        return await step.replaceDialog(MAIN_WATERFALL_DIALOG);
    }

    async useApiService(step) {
        console.log('useApiServ');
        return await step.prompt(TEXT_PROMPT, 'Write the text to analyze');
    }

    async comsumeApi(step) {
        console.log('comsumeApi');
        const textRecived = step.result;
        const serviceSelected = step.stack[0].state.options;

        var axios = require('axios');
        var data = JSON.stringify({
            kind: serviceSelected,
            parameters: {
                modelVersion: 'latest'
            },
            analysisInput: {
                documents: [
                    {
                        id: '1',
                        text: textRecived
                    }

                ]
            }
        });

        var config = {
            method: 'post',
            url: `${ process.env.Cognitive_Services_Endpoint }/language/:analyze-text?api-version=2022-05-01`,
            headers: {
                'Ocp-Apim-Subscription-Key': process.env.Cognitive_Services_Key,
                'Content-Type': 'application/json'
            },
            data: data
        };

        const res = await axios(config)
            .then(function(response) {
                return JSON.stringify(response.data);
            })
            .catch(function(error) {
                console.log(error);
            });

        step.context.sendActivity(res);
        return await step.replaceDialog(MAIN_WATERFALL_DIALOG);
    }
}

module.exports.MainDialog = MainDialog;
