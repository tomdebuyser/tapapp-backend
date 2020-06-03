import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import * as InlineCss from 'inline-css';

import { MailTemplate } from '../src/mailer.types';

const TEMPLATES_PATH = `${__dirname}/../src/templates`;
const COMPILED_TEMPLATES_PATH = `${TEMPLATES_PATH}/compiled`;

const brandStyles = {
    primaryColor: '#002548',
    buttonColor: '#009AC7',
    name: 'Silvernext',
    logo:
        'https://icapps.com/profiles/vb_profile/themes/icapps/images/icapps-wit-new.svg',
};

// Create a 'compiled' folder
try {
    mkdirSync(COMPILED_TEMPLATES_PATH);
} catch (e) {
    // Already exists
}

// Read the wrapper file
const wrapper = readFileSync(
    `${TEMPLATES_PATH}/wrapper.template.html`,
).toString();

// Generate each template
const promises = Object.values(MailTemplate).map(async name => {
    const template = readFileSync(
        `${TEMPLATES_PATH}/${name}.template.html`,
    ).toString();

    // Substitute the template into the wrapper
    let result = wrapper.replace('{{innerTemplate}}', template);

    // Substitute the template variables
    result = result
        .replace(/brandPrimaryColor/gi, brandStyles.primaryColor)
        .replace(/brandButtonColor/gi, brandStyles.buttonColor)
        .replace(/{{brandName}}/gi, brandStyles.name)
        .replace(/{{brandLogo}}/gi, brandStyles.logo);

    // Inline the styles
    result = await InlineCss(result, { removeStyleTags: false, url: ' ' });

    // Add the resultinh html file to the 'compiled' folder
    writeFileSync(`${COMPILED_TEMPLATES_PATH}/${name}.template.html`, result);

    return true;
});

Promise.all(promises).then(() =>
    console.log('Mail templates compiled successfully!'),
);
