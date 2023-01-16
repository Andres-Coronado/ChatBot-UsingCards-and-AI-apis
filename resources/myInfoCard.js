
const { CardFactory } = require('botbuilder');

function getInfoCard(usrInfo) {
    const myInfo = CardFactory.adaptiveCard({
        type: 'AdaptiveCard',
        body: [
            {
                type: 'TextBlock',
                size: 'Medium',
                weight: 'Bolder',
                text: 'Your Info',
                style: 'heading'
            },
            {
                type: 'ColumnSet',
                columns: [
                    {
                        type: 'Column',
                        items: [
                            {
                                type: 'Image',
                                style: 'Person',
                                url: 'https://snipstock.com/assets/cdn/png/920901cb514eae669c0ac9cc2fb76746.png',
                                altText: 'INFO',
                                size: 'Small'
                            }
                        ],
                        width: 'auto'
                    },
                    {
                        type: 'Column',
                        items: [
                            {
                                type: 'TextBlock',
                                weight: 'Bolder',
                                text: usrInfo.displayName,
                                wrap: true
                            },
                            {
                                type: 'TextBlock',
                                spacing: 'None',
                                text: usrInfo.jobTitle,
                                isSubtle: true,
                                wrap: true
                            },
                            {
                                type: 'TextBlock',
                                spacing: 'None',
                                text: `Email: ${ usrInfo?.mail ?? usrInfo?.userPrincipalName ?? '' }`,
                                isSubtle: true,
                                wrap: true
                            }
                        ],
                        width: 'stretch'
                    }
                ]
            },
            {
                type: 'TextBlock',
                text: 'Esta informacion viene desde Graph',
                wrap: true
            },
            {
                type: 'ColumnSet',
                columns: [
                    {
                        type: 'Column',
                        width: 'stretch',
                        items: [
                            {
                                type: 'TextBlock',
                                text: 'officeLocation',
                                wrap: true
                            }
                        ]
                    },
                    {
                        type: 'Column',
                        width: 'stretch',
                        items: [
                            {
                                type: 'TextBlock',
                                text: usrInfo.officeLocation,
                                wrap: true
                            }
                        ]
                    }
                ]
            },
            {
                type: 'ColumnSet',
                columns: [
                    {
                        type: 'Column',
                        width: 'stretch',
                        items: [
                            {
                                type: 'TextBlock',
                                text: 'preferredLanguage',
                                wrap: true
                            }
                        ]
                    },
                    {
                        type: 'Column',
                        width: 'stretch',
                        items: [
                            {
                                type: 'TextBlock',
                                text: usrInfo.preferredLanguage,
                                wrap: true
                            }
                        ]
                    }
                ]
            }

        ],
        $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
        version: '1.0'
    });
    return myInfo;
}

module.exports.getInfoCard = getInfoCard;
