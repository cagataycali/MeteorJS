/**
 * Yazılar
 * @type {Mongo.Collection}
 */
Yazilar = new Mongo.Collection("Yazilar");

/**
 * Sadece istemcide çalışacak kodlar
 */
if (Meteor.isClient) {

  /**
   * Kayıtları kullanıcı adı üzerinden almak için.
   */
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

  console.log("Merhaba client!");

  Template.yazilar.helpers({

    yazilar: function () {

      return Yazilar.find();

    }
  })
}

if (Meteor.isServer) {

  console.log("Merhaba server!");

}