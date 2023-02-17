const axios = require('axios').default;
var CronJob = require('cron').CronJob;

function notification(message) {

    let count=0;

    var job = new CronJob('1 * * * * *', function() {
      console.log(count++,message);
    }, null, true, 'America/Los_Angeles');
    job.start();

    // var notification = {
    //     'title': "Message",
    //     'body': message
    // };
    // var notification_body = {
    //     'notification': notification,
    //     'to': 'd4f7M45U9AE:APA91bFq4CTHG7hUQOfkbXo1leM3wE-g4l65FU6j8tejUSa0p9k6UDeDfleSW3tK_qrUxTsVt5-UVMpRJcYLeKYEpk3bOJ3Opu53zqY7MKPb2Ey-Vzf0pqOfy_hgJ6UahLcgm7luJhrG'
    // }
    // axios.post('/https://fcm.googleapis.com/fcm/send', {
    //     'headers': {
    //         // replace authorization key with your key
    //         'Authorization': 'key=' + 'AAAA6ikBmPI:APA91bHvt3GXmuBoEowZDkO8swpVz43esKvGuKGllW-Yql047vldv2byHBWzyKq9d1vTN8ogbJcO70_xYn_Qtx6Jb9PqBQIvap9R6JO0JJX-38JtTa3h5RH_uctw08JKUq5pT8Jzlnd0',
    //         'Content-Type': 'application/json'
    //     },
    //     'body': JSON.stringify(notification_body)
    //   })
    //   .then(function (response) {
    //     console.log(response);
    //   })
    //   .catch(function (error) {
    //     console.log(error);
    //   });
    // fetch('https://fcm.googleapis.com/fcm/send', {
    //     'method': 'POST',
    //     'headers': {
    //         // replace authorization key with your key
    //         'Authorization': 'key=' + 'AAAA6ikBmPI:APA91bHvt3GXmuBoEowZDkO8swpVz43esKvGuKGllW-Yql047vldv2byHBWzyKq9d1vTN8ogbJcO70_xYn_Qtx6Jb9PqBQIvap9R6JO0JJX-38JtTa3h5RH_uctw08JKUq5pT8Jzlnd0',
    //         'Content-Type': 'application/json'
    //     },
    //     'body': JSON.stringify(notification_body)
    // }).then(function (response) {
    //     console.log(response);
    // }).catch(function (error) {
    //     console.error(error);
    // })
}
module.exports = notification;