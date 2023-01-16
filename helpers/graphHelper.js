// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

// <UserAuthConfigSnippet>
require('isomorphic-fetch');
const azure = require('@azure/identity');
const graph = require('@microsoft/microsoft-graph-client');
const authProviders =
  require('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');

let _settings;
let _deviceCodeCredential;
let _userClient;

function initializeGraphForUserAuth(settings, deviceCodePrompt) {
    // Ensure settings isn't null
    if (!settings) {
        throw new Error('Settings cannot be undefined');
    }

    _settings = settings;

    _deviceCodeCredential = new azure.DeviceCodeCredential({
        clientId: settings.clientId,
        tenantId: settings.authTenant,
        userPromptCallback: deviceCodePrompt
    });

    const authProvider = new authProviders.TokenCredentialAuthenticationProvider(
        _deviceCodeCredential, {
            scopes: settings.graphUserScopes
        });

    _userClient = graph.Client.initWithMiddleware({
        authProvider: authProvider
    });
}
module.exports.initializeGraphForUserAuth = initializeGraphForUserAuth;
// </UserAuthConfigSnippet>

// </GetUserTokenSnippet>

// <GetUserSnippet>
async function getUserAsync() {
    // Ensure client isn't undefined
    if (!_userClient) {
        throw new Error('Graph has not been initialized for user auth');
    }

    return _userClient.api('/me')
    // Only request specific properties
        .select(['givenName', 'displayName', 'mail', 'userPrincipalName', 'officeLocation', 'jobTitle', 'preferredLanguage'])
        .get();
}
module.exports.getUserAsync = getUserAsync;
// </GetUserSnippet>

// <SendMailSnippet>
async function sendMailAsync(subject, body, recipient) {
    // Ensure client isn't undefined
    if (!_userClient) {
        throw new Error('Graph has not been initialized for user auth');
    }

    // Create a new message
    const message = {
        subject: subject,
        body: {
            content: body,
            contentType: 'text'
        },
        toRecipients: [
            {
                emailAddress: {
                    address: recipient
                }
            }
        ]
    };

    // Send the message
    return _userClient.api('me/sendMail')
        .post({
            message: message
        });
}
module.exports.sendMailAsync = sendMailAsync;
// </SendMailSnippet>
