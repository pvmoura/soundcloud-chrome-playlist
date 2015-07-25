  // initialize client with app credentials
  SC.initialize({
    client_id: '3cfc276356e86e5aa30290c4362ed56d',
    redirect_uri: 'http://pvmoura.github.io/soundcloud-chrome-radio/'
  });

  // initiate auth popup
  SC.connect(function() {
    SC.get('/me', function(me) {
      alert('Hello, ' + me.username);
    });
  });