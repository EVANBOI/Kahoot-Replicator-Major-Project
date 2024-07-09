import { adminQuizTrashView } from "../wrappers";
import { clear } from "../wrappers";
import { ok } from '../helpers';


const VALID_INPUTS = {
    EMAIL: 'admin@email.com',
    PASSWORD: 'password1',
    FIRSTNAME: 'Idk',
    LASTNAME: 'Idk'
  };

beforeEach(() => {
    clear();
});

test('Token is invalid', () => {
})