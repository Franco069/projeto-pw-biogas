import Profile from "../../app/scripts/profile.js";
import Users from "../../_common/classes/Users.js";

export default class AdminProfile extends Profile {
    constructor(storage) {
        super(storage);
        this.users = new Users(1);
    }
}
