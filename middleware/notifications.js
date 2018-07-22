const { User } = require('../models/user');
var apn = require('apn');
var options = {
    token: {
      key: "apns.p8",
      keyId: "42LJJL3575",
      teamId: "26Z24PM6F7"
    },
    production: false
  };
var apnProvider = new apn.Provider(options);

exports.sendNotification = async function(phoneNumber) {
    const user = await User.findOne({ phoneNumber: phoneNumber })
    
    if (user) { 
        let note = new apn.Notification();
        note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
        note.badge = 3;
        note.sound = "ping.aiff";
        note.alert = "\uD83D\uDCE7 \u2709 You have a new message";
        note.payload = {'messageFrom': 'John Appleseed'};
        note.topic = "clukLabs.double-date";
        await apnProvider.send(note, user.apnToken);
    }
    
}