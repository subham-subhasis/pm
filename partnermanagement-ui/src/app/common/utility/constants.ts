export const baseURL = '';
export const replaceURL = '';
export const customMessages = {
    workflow: {
        modalHeaderOnMoveBack: 'Enter Reason For Moving Back',
        requestForMoreInfo: 'Enter Additional Information',
        alertMessgaeForAprove: 'Are you sure you want to move this card here?',
        alertMessageApproveonButtonClick: 'Are you sure you want to approve this partner to next stage?',
        errorMessageCheckList: 'Error occurred while fetching checklist details.',
        errorMessageCheckListsave: 'An Error Has Occurred, Please Contact the Administrator.'
    },
    partnerCandidate: 'partner candidate',
    myBucket: 'my bucket',
    noRecords: 'No records found.',
    configure: {
        saveKPI: 'Data saved successfully.',
        groupAdd: 'Group added successfully.',
        deleteGroup: 'Group deleted successfully.'
    },
    partnerSearch: {
        updatePartner: 'Partner data updated successfully.',
        updateFailed: 'Update Failed. ',
        noPartnersFound: 'No Partner(s) Found.'
    },
    errorMessage: 'An Error Has Occurred, Please Contact the Administrator.',
    errorMessage404: '404 error!!! Please contact the administrator.',
    blockChainErrorMessage: 'Some error occurred in Blockchain registration. Please contact the administrator.',
    slectOneValue: 'Please select one plan and add.',
    selectBusniessType: 'Please select Type Of Business Or Group',
    manadateMessage: 'Please fill all the manadtory fields.',
    emailConfirmEmailMatch: 'Email & Confirm Email do not match.',
    blockchainRegistration: 'Organisation registration in process.',
    manadateMessageTypeForBlockchain: 'Please select at least one type to register an organisation.'
};

export const  maticon = {
    MENU: 'menu',
    CHANGEPASSWORD: 'how_to_reg',
    HELP: 'help_outline',
    ARROWDROPDOWN: 'arrow_drop_down',
    ACCOUNTHEADER: 'account_circle',
    KEYBOARDARROWRIGHT: 'keyboard_arrow_right',
    KEYBOARDARROWLEFT: 'keyboard_arrow_left'
};

export const greetings = {
    morning: 'Good Morning',
    afternoon: 'Good Afternoon',
    evening: 'Good Evening'
};

export const tabTitle = {
    landing: 'PM',
};

export const validationPatterns = {
    number: '^[0-9]+$',
    decimal: '[+-]?([0-9]*[.])?[0-9]+',
    email: /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,3})$/,
    name: '[a-zA-Z ,.]*',
    nameValidation: '[a-zA-Z .]*',
    extractNumber: /[-]{0,1}[\d]*[\.]{0,1}[\d]+/g,
    specialName: '[a-zA-Z ,.-]*',
    restrictSpecialChar: '^[a-zA-Z0-9]*$',
    maxPercentage: '^(100(\.00?)?|[1-9]?\d(\.\d\d?)?)$'
};

export const HTTP_ERRORS = [401, 500, 403];

export const notFound = 404;

export const API = {
    getConfiguration: 'assets/config/config.json',
    getConfigureKPIJson: './assets/json/constantsForConfigure.json',
    getApplicaionConfigure: './assets/json/applicationConfiguraion.json',
    getFiledGroups: '/fieldgroups/',
    getConfigurationKPI: '/profileinfos',
    getPartnerInfo: '/partnerinfos',
    saveConfiguration: '/profileinfos',
    editConfiguration: '/profileinfos/1',
    createPartner: '/partnerinfos'
};

export const dateConfiguration: any = {
    placeholder: 'DD-MM-YYYY',
    dateFormat: 'dd-mm-yy',
    showIcon: 'true',
    dataType: 'date',
    monthNavigator: 'true',
    yearNavigator: 'true',
    yearRange: '1950:2050'
};

