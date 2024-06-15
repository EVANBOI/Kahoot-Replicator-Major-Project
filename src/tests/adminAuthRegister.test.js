import { adminAuthRegister } from "../auth.js";
import { clear } from "../other.js";

const ERROR = { error: expect.any(String) };
const REGISTRATED = { authUserId: expect.any(Number) };


const VALID_INPUTS = {
    EMAIL: 'admin@email.com',
    PASSWORD: 'password',
    FIRSTNAME: 'Idk',
    LASTNAME: 'Idk'
}

beforeEach(() => {
    clear();
})

describe('Successful registration testa', () => {
    test('All inputs are valid', () => {
        expect(adminAuthRegister(VALID_INPUTS.EMAIL, 
            VALID_INPUTS.PASSWORD, 
            VALID_INPUTS.FIRSTNAME, 
            VALID_INPUTS.LASTNAME)).toStrictEqual(REGISTRATED)
    });

    describe('Successful First Name tests', () => {
        test.each([
            {
                testName: 'First name with hyphen',
                nameFirst: 'Hello-',
            },
            {
                testName: 'First name with comma',
                nameFirst: 'He,llo'
            },
            {
                testNmae: 'First name with space',
                nameFirst: 'He llo'
            }
        ])('Test $#: $testName', ({ nameFirst }) => {
            expect(adminAuthRegister(VALID_INPUTS.EMAIL, 
                VALID_INPUTS.PASSWORD, 
                nameFirst, 
                VALID_INPUTS.LASTNAME)).toStrictEqual(REGISTRATED);
        });
    });

    describe('Successful Last Name tests', () => {
        test.each([
            {
                testName: 'Last name with hyphen',
                nameLast: '-woah'
            },
            {
                testName: 'Last name with comma',
                nameLast: 'w,oa,h'
            },             
            {
                testNmae: 'Last name with apostrophe',
                nameLast: "'He'l'lo"
            }
        ])('Test $#: $testName', ({ nameFirst }) => {
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
            VALID_INPUTS.LASTNAME)).toStrictEqual({ ERROR })
    }) 
    test('Input is not an email', () => {
        expect(adminAuthRegister('123', 
            VALID_INPUTS.PASSWORD, 
            VALID_INPUTS.FIRSTNAME, 
            VALID_INPUTS.LASTNAME)).toStrictEqual({ ERROR })
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
            testName: "First name is less than 2 characters",
            nameFirst: 'JJ'
        },
        {
            testName: "First name is more than 20 characters",
            nameFirst: 'Isthismorethantwentycharactersprobablyhopefullysurely'
        },
        {
            testName: "First name with multiple errors",
            nameFirst: 'H1!!@ sdofih ooiuoisf ohl309fivn3 4uybd88y+++...'
        }
    ])("Test $#: $testName", ({ nameFirst }) => {
        expect(adminAuthRegister(VALID_INPUTS.EMAIL, 
            VALID_INPUTS.PASSWORD, 
            nameFirst, 
            VALID_INPUTS.LASTNAME)).toStrictEqual(ERROR);
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
            testName: "Last name is less than 2 characters",
            nameFirst: 'JJ'
        },
        {
            testName: "Last name is more than 20 characters",
            nameFirst: 'Isthismorethantwentycharactersprobablyhopefullysurely'
        },
        {
            testName: "Last name with multiple errors",
            nameFirst: 'H1!!@ sdofih ooiuoisf ohl309fivn3 4uybd88y+++...'
        }
    ])("Test $#: $testName", ({ nameLast }) => {
        expect(adminAuthRegister(VALID_INPUTS.EMAIL, 
            VALID_INPUTS.PASSWORD, 
            VALID_INPUTS.FIRSTNAME, 
            nameLast)).toStrictEqual(ERROR)
    });
})

describe('Password unsuccesful tests', () => {
    test.each([
        {
            testName: 'Password with less than 8 characters',
            pasword: 'pass1'
        },
        {
            testName: 'Password with only letters',
            pasword: 'password'
        },             
        {
            testNmae: 'Password with only numbers',
            password: '12345678'
        }, 
        {
            testName: 'Password with less than 8 characters and only letters',
            password: 'pass'
        }
    ])('Test $#: $testName', ({ password }) => {
        expect(adminAuthRegister(VALID_INPUTS.EMAIL, 
            password, 
            VALID_INPUTS.FIRSTNAME, 
            VALID_INPUTS.LASTNAME)).toStrictEqual(ERROR);
    });
})