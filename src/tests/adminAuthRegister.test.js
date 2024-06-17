import { adminAuthRegister } from "../auth.js";
import { clear } from "../other.js";

const REGISTRATED = { authUserId: expect.any(Number) };

const VALID_INPUTS = {
    EMAIL: 'admin@email.com',
    PASSWORD: 'password1',
    FIRSTNAME: 'Idk',
    LASTNAME: 'Idk'
}

beforeEach(() => {
    clear();
})

describe('Successful registration tests', () => {
    test('All inputs are valid', () => {
        expect(adminAuthRegister(VALID_INPUTS.EMAIL, 
            VALID_INPUTS.PASSWORD, 
            VALID_INPUTS.FIRSTNAME, 
            VALID_INPUTS.LASTNAME)).toStrictEqual(REGISTRATED);
    });

    describe('More cases for successful First Name tests', () => {
        test.each([
            {
                testName: 'First name with hyphen',
                nameFirst: 'Hello-',
            },
            {
                testName: 'First name with apostrophe',
                nameFirst: "He''llo"
            },
            {
                testName: 'First name with space',
                nameFirst: 'He llo'
            }
        ])('Test $#: $testName', ({ nameFirst }) => {
            expect(adminAuthRegister(VALID_INPUTS.EMAIL, 
                VALID_INPUTS.PASSWORD, 
                nameFirst, 
                VALID_INPUTS.LASTNAME)).toStrictEqual(REGISTRATED);
        });
    });

    describe('More cases for successful Last Name tests', () => {
        test.each([
            {
                testName: 'Last name with hyphen',
                nameLast: '-woah'
            },
            {
                testName: 'Last name with space',
                nameLast: "w oah"
            },             
            {
                testName: 'Last name with apostrophe',
                nameLast: "'He'l'lo"
            }
        ])('Test $#: $testName', ({ nameLast }) => {
            expect(adminAuthRegister(VALID_INPUTS.EMAIL, 
                VALID_INPUTS.PASSWORD, 
                VALID_INPUTS.FIRSTNAME, 
                nameLast)).toStrictEqual(REGISTRATED);
        });
    });
})

describe('Email unsuccessful tests', () => {
    test('Repeated email', () => {
        adminAuthRegister(VALID_INPUTS.EMAIL, 
            VALID_INPUTS.PASSWORD, 
            VALID_INPUTS.FIRSTNAME, 
            VALID_INPUTS.LASTNAME)
        expect(adminAuthRegister(VALID_INPUTS.EMAIL, 
            VALID_INPUTS.PASSWORD, 
            VALID_INPUTS.FIRSTNAME, 
            VALID_INPUTS.LASTNAME)).toStrictEqual({ error: 'Email address is used by another user.' })
    }) 
    test('Input is not an email', () => {
        expect(adminAuthRegister('123', 
            VALID_INPUTS.PASSWORD, 
            VALID_INPUTS.FIRSTNAME, 
            VALID_INPUTS.LASTNAME)).toStrictEqual({ error: 'Email does not satisfy this: https://www.npmjs.com/package/validator (validator.isEmail function).' })
    });
})

describe('First Name unsuccessful tests', () => {
    test.each([
        {
            testName: "First name with number",
            nameFirst: 'J23',
        },
        {
            testName: "First name with symbols",
            nameFirst: 'He@l+o',
        },
        {
            testName: "First name with character error first and then length error",
            nameFirst: 'H1!!@ sdofih ooiuoisf ohl309fivn3 4uybd88y+++...'
        }, 
        {
            testName: 'First name with length error first and then character error',
            nameFirst: 'lsdkfjghsfljfadskadshajakdadsfafdfsdaakfh!!++ 99'
        }
    ])("Test $#: $testName", ({ nameFirst }) => {
        expect(adminAuthRegister(VALID_INPUTS.EMAIL, 
            VALID_INPUTS.PASSWORD, 
            nameFirst, 
            VALID_INPUTS.LASTNAME)).toStrictEqual({ 
                error: 'NameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.' });
    });

    test.each([
        {
            testName: "First name is less than 2 characters",
            nameFirst: 'J'
        },
        {
            testName: "First name is more than 20 characters",
            nameFirst: 'a'.repeat(30)
        }
    ])("Test $#: $testName", ({ nameFirst }) => {
        expect(adminAuthRegister(VALID_INPUTS.EMAIL, 
            VALID_INPUTS.PASSWORD, 
            nameFirst, 
            VALID_INPUTS.LASTNAME)).toStrictEqual({ 
                error: 'NameFirst is less than 2 characters or more than 20 characters.' });
    });
})

describe('Last Name unsuccessful tests', () => {
    test.each([
        {
            testName: "Last name with number",
            nameLast: 'Z00k'
        },
        {
            testName: "Last name with full stop",
            nameLast: 'w, oa.h'
        },
        {
            testName: "Last name with character error first and then length error",
            nameLast: 'H1!!@ sdofih ooiuoisf ohl309fivn3 4uybd88y+++...'
        }, 
        {
            testName: 'Last name with length error first and then character error',
            nameLast: 'lsdkfjghsfljfadskadshajakdadsfafdfsdaakfh!!++ 99'
        }
    ])("Test $#: $testName", ({ nameLast }) => {
        expect(adminAuthRegister(VALID_INPUTS.EMAIL, 
            VALID_INPUTS.PASSWORD, 
            VALID_INPUTS.FIRSTNAME, 
            nameLast)).toStrictEqual({ 
                error: 'NameLast contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.' });
    });
    test.each([
        {
            testName: "Last name is less than 2 characters",
            nameLast: 'J'
        },
        {
            testName: "Last name is more than 20 characters",
            nameLast: 'a'.repeat(30)
        }
    ])("Test $#: $testName", ({ nameLast }) => {
        expect(adminAuthRegister(VALID_INPUTS.EMAIL, 
            VALID_INPUTS.PASSWORD, 
            VALID_INPUTS.FIRSTNAME, 
            nameLast)).toStrictEqual({ 
                error: 'NameLast is less than 2 characters or more than 20 characters.' });
    });
})

describe('Password unsuccesful tests', () => {
    test.each([
        {
            testName: 'Password with less than 8 characters',
            password: 'pass1'
        },
        {
            testName: 'Password with less than 8 characters and only letters',
            password: 'pass'
        }
    ])('Test $#: $testName', ({ password }) => {
        expect(adminAuthRegister(VALID_INPUTS.EMAIL, 
            password, 
            VALID_INPUTS.FIRSTNAME, 
            VALID_INPUTS.LASTNAME)).toStrictEqual({ error: 'Password is less than 8 characters.'});
    });

    test.each([
        {
            testName: 'Password with only letters',
            password: 'password'
        },             
        {
            testName: 'Password with only numbers',
            password: '12345678'
        }
    ])('Test $#: $testName', ({ password }) => {
        expect(adminAuthRegister(VALID_INPUTS.EMAIL, 
            password, 
            VALID_INPUTS.FIRSTNAME, 
            VALID_INPUTS.LASTNAME)).toStrictEqual({ error: 'Password does not contain at least one number and at least one letter.'});
    });
})