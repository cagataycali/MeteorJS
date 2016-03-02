/**
 * Yazılar
 * @type {Mongo.Collection}
 */
Yazilar = new Mongo.Collection("Yazilar");
Yorumlar = new Mongo.Collection("Yorumlar");


/**
 * Meteor user
 */
Meteor.users.helpers({

    user_name: function() {
        return this.username;
    },
    /**
     * One To Many
     * Kullanıcının yazıları
     * @returns {Cursor}
     */
    yazilar: function () {
        return Yazilar.find({kullaniciId:Meteor.userId()});
    },
    /**
     * One To Many
     * Kullanıcının yorumları
     * @returns {Cursor}
     */
    yorumlar: function () {
        return Yorumlar.find({kullaniciId:Meteor.userId()});
    }

});

Yazilar.helpers({


    /**
     * İlgili yazının yorumları
     * One To Many
     * @returns {Cursor}
     */
    yorumlar: function () {

        /**
         * Yorumları o zaman çekiyoruz.
         */
        return Yorumlar.find({yaziId:this._id});
    },

    /**
     * Many To One
     * @returns {DOMElement|*|{}|any|Cursor}
     */
    kullanici: function () {
        return Meteor.users.findOne({_id:this.kullaniciId});
    }
});

Yorumlar.helpers({

    /**
     * Many To One
     * Yorumun kullanıcısı
     */
    kullanici: function () {
        return Meteor.users.findOne({_id:this.kullaniciId});

    },
    /**
     * Many To One
     * Yorumun yazısı
     */
    yazi: function () {
        return Yazilar.findOne({_id:yaziId});
    }

});


/**
 * Sadece istemcide çalışacak kodlar
 */
if (Meteor.isClient) {


  console.log("Merhaba client!");


  /**
   * Kayıtları kullanıcı adı üzerinden almak için.
   */
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });


  /**
   * Kullanıcıların kendi yazıları sunucudan publish ( paylaşılıyor ) bizde onu subscribe ( takip ) ediyoruz!
   * Bu sayede veritabanından veriler kullanıcı bazlı filtrelenerek geliyor.
   */
  Meteor.subscribe('kullaniciYazilari');
  Meteor.subscribe('yaziYorumlari');

  Template.yazilar.helpers({

    yazilar: function () {

      /**
       * Tüm yazıları çekmesini istedik fakat sunucu taraflı paylaşılan verilerin hepsi filtrelenerek geliyor.
       * Bu sayede kimsenin verisi birbirine gitmiyor.
       */
      return Yazilar.find();

    }
  });


  /**
   * Yazılar adlı template'in events'leri yani;
   * Kullanıcı dom elementlerinden birine tıkladığında x işlemi yap.
   * jQuery yazan kişiler bu senaryoya hakimdir.
   */
  Template.yazilar.events({

  'click li': function () {

    Session.set("yaziId",this._id);

      var session_val = Session.get("yaziId");

      console.log(session_val);
  },

    'click .sil': function () {

      yazi = this._id;

      Meteor.call("yaziSil",yazi);
      
    }

  });


    /**
     *
     */
   Template.yorumEkle.events({

       'submit form': function () {

           /**
            * Yazı id değerini yakaladıkk!
            * Yöntem 1
            * @type {*|string|string}
            */
           var yazi = this._id;

           event.preventDefault();

           var yorum = event.target.yorum_icerik.value;

           console.log("Yorum: ");
           console.log(yorum);

           console.log("Yazi .this_id ile gelen: ");
           console.log(yazi);

           /**
            * Yazı id değerini yakalama yöntem 2
            * @type {any}
            */
           var session_yazi_id = Session.get("yaziId");

           console.log("Yazi session ile gelen: ");
           console.log(session_yazi_id);
       }

   });

    /**
     * Yazı Ekle adlı template'in events'leri yani;
     * Kullanıcı dom elementlerinden birine tıkladığında x işlemi yap.
     * jQuery yazan kişiler bu senaryoya hakimdir.
     */
    Template.yaziEkle.events({

        'submit form': function (event) {

            event.preventDefault();

            var yazi = event.target.yazi.value;

            Meteor.call('yaziEkle',yazi);

            event.target.yazi.value = "";
        }

    });
}

if (Meteor.isServer) {

  console.log("Merhaba server!");

  /**
   * Meteor veritabanından verileri paylaşacak ve istemci bu verileri yakalayarak ekrana basacak.
   * Meteor.publish metodunu kullanarak işlerimizi halledeceğiz.
   */
  Meteor.publish('kullaniciYazilari', function () {

    // this.userId değeri ile giriş yapan kullanıcının id değerini işledik.
    var kullanici = this.userId;

    // Giriş yapan kullanıcının yazılarını çekmesini istedik.
    return Yazilar.find({kullaniciId: kullanici});

  });

    Meteor.publish('yaziYorumlari', function () {

        return Yorumlar.find();

    });

  /**
   * Meteor'un metods metodu,
   * Veritabanımıza gireceğimiz (insert) verilerin güvenlik dahilinde
   * İçeri aktarılması içindir!
   */
  Meteor.methods({

  /**
   * Yazı Ekleme Metodu
   * @param yazi
   */
  'yaziEkle': function (yazi) {
      Yazilar.insert({
          kullaniciId : Meteor.userId(), // Meteor.userId() değeri ile giriş yapan kullanıcının id değerini işledik!
          icerik : yazi,
          createdAt : new Date
      });
      console.log("Yazı eklendi!");
  },
    'yaziSil': function (yazi) {

      Yazilar.remove({_id : yazi, kullaniciId : Meteor.userId()}); // Meteor.userId() değeri ile giriş yapan kullanıcının id değerine göre veriyi işledik!

    }


  })

}