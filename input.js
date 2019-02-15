var balance = 0;
var myDBInstance = openDatabase('db', '1.0', 'Test', 2 * 1024 * 1024);
if (!myDBInstance) {
  alert('Oops, your database was not created');
}
else {
  var version = myDBInstance.version;
  myDBInstance.transaction(function (tran) {
    // tran.executeSql('DELETE FROM Income');
    // tran.executeSql('DELETE FROM groupofexpense');
    // tran.executeSql('DELETE FROM users');
    // tran.executeSql('DELETE FROM groupmembers');
    // tran.executeSql('DELETE FROM Cash');
    // tran.executeSql('DELETE FROM Bill');
    // tran.executeSql('DELETE FROM GroupEvent');
    // tran.executeSql('DELETE FROM EventMembers');

    // tran.executeSql('DROP TABLE groupofexpense');
    // tran.executeSql('DROP TABLE users');
    // tran.executeSql('DROP TABLE groupmembers');
    // tran.executeSql('DROP TABLE Cash');
    // tran.executeSql('DROP TABLE Income');
    // tran.executeSql('DROP TABLE Bill');
    // tran.executeSql('DROP TABLE GroupEvent');
    // tran.executeSql('DROP TABLE EventMembers');

    tran.executeSql('CREATE TABLE IF NOT EXISTS Income(id INTEGER PRIMARY KEY, income INTEGER)');
    tran.executeSql('CREATE TABLE IF NOT EXISTS groupofexpense(id INTEGER PRIMARY KEY, groupname, Cash INTEGER)');
    tran.executeSql('CREATE TABLE IF NOT EXISTS users (userid INTEGER PRIMARY KEY, Name UNIQUE)');
    tran.executeSql('CREATE TABLE IF NOT EXISTS groupmembers (userid INTEGER, groupid INTEGER, PRIMARY KEY(userid, groupid))');
    tran.executeSql('CREATE TABLE IF NOT EXISTS Cash(id INTEGER PRIMARY KEY, cash INTEGER)');
    tran.executeSql('CREATE TABLE IF NOT EXISTS Bill(billid INTEGER PRIMARY KEY, groupevent, paidby, paysto, cash INTEGER, gid INTEGER)');
    tran.executeSql('CREATE TABLE IF NOT EXISTS GroupEvent(eid INTEGER PRIMARY KEY, gid INTEGER, groupevent, cash INTEGER)');
    tran.executeSql('CREATE TABLE IF NOT EXISTS EventMembers(id INTEGER, gid INTEGER, eid INTEGER)');

    tran.executeSql('insert or ignore into users(Name) values("Me")');
    tran.executeSql('insert or ignore into Income(id, income) values((SELECT userid from users where Name = "Me"), 0)');
    tran.executeSql('insert or ignore into Cash(id, cash) values((SELECT userid from users where Name = "Me"), 0)');
    tran.executeSql('SELECT * FROM Income', [], function(tran, data) {
      income = Number(data.rows[0].income);
      document.getElementById("balance").innerHTML = income;
    });
  });
  printBalance();
  myDBInstance.transaction(function(tran) {
    tran.executeSql('SELECT * from Bill', [], function(tran3, data3) {if(data3.rows.length != 0){initialcalc();}});
  });

  function updateIncome() {
    var inc = 0;
    inc = Number(document.getElementById("income").value);
    printBalance(inc);
    html = "<div class=\"alert alert-success alert-dismissible\"><a href=\"#\" class=\"close\" data-dismiss=\"alert\" aria-label=\"close\">&times;</a><strong>Success!</strong> Income Updated.</div>";
    document.getElementById("alertbox").innerHTML = html;
  }

  function printBalance(inc = 0){
    var income1 = 0;
    myDBInstance.transaction(function (tran){
      tran.executeSql('SELECT * FROM Income', [], function(tran, data) {
        income1 = Number(data.rows[0].income);
        income1 += inc;
        tran.executeSql('UPDATE Income SET income = ? where id = (SELECT userid from users where Name = "Me")', [income1]);
      });
      tran.executeSql('SELECT cash FROM Cash where id = (SELECT userid from users where Name = "Me")', [], function(tran, data) {
        balance = (Number(data.rows[0].cash).toFixed(2));
        document.getElementById("balance").innerHTML = Number(income1) + Number(balance);
      });
    });
  }

  function printBill() {
    myDBInstance.transaction(function (tran) {
      tran.executeSql('SELECT * FROM Bill', [], function(tran, data) {
        var html = '';
        html = "<h2>Bill Details</h2><br><table class=\"table table-bordered table-striped\"><thead><tr><th>Bill ID</th><th>Event</th><th>From</th><th>To</th><th>Cash</th></tr></thead><tbody id=\"myBill\">";
        for (i = 0; i < data.rows.length; i++) {
          html += '<tr><td>' + data.rows[i].billid + '</td><td>' + data.rows[i].groupevent + '</td><td>' + data.rows[i].paidby + '</td><td>' + data.rows[i].paysto + '</td><td>' + data.rows[i].cash + '</td></tr>';
        }
        html += "</tbody></table>";
        document.getElementById("billTab").innerHTML = html;
      });
    });
  }

  function printTab(){
    myDBInstance.transaction(function (tran) {
      var html = '';
      tran.executeSql('SELECT * FROM groupofexpense', [], function (tran, data) {
        for (i = 0; i < data.rows.length; i++) {
          html += '<tr><td>' + data.rows[i].id + '</td><td>' + data.rows[i].groupname + '</td><td id="t' + i + '"></td><td>' + data.rows[i].Cash + '</td></tr>';
        }
        document.getElementById("myTab").innerHTML = html;
      });
    });
    var html = [];
    myDBInstance.transaction(function (tran) {
      var html1 = '';
      for(k=0;k<i;k++) {
        tran.executeSql('SELECT Name FROM users where userid in (SELECT userid FROM groupmembers where groupid = ?)', [k+1], function(tran, data1) {
          for(j=0; j < data1.rows.length; j++) {
            html1 += data1.rows[j].Name + " ";
          }
          html.push(html1);
          html1 = '';
        });
      }
    });
    myDBInstance.transaction(function (tran) {
      for(i=0;i<html.length;i++) {
        document.getElementById("t"+i).innerHTML = html[i];
      }
    });
  }

  function printEvent() {
    myDBInstance.transaction(function (tran) {
      var html = '';
      tran.executeSql('SELECT * FROM GroupEvent', [], function(tran, data) {
        html += "<h2>Event</h2><br><table class=\"table table-bordered table-striped\"><thead><tr><th>Event ID</th><th>Group ID</th><th>Event</th><th>Cash</th><th>Update</th></tr></thead><tbody id=\"myBill\">";
        for(i=0;i<data.rows.length;i++) {
          html += "<tr onClick=\"populatePayee(this)\"><td>" + data.rows[i].eid + "</td><td>" + data.rows[i].gid + "</td><td>" + data.rows[i].groupevent + "</td><td>" + data.rows[i].cash + "</td><td><button id=\"event" + data.rows[i].gid + "class=\"btn btn-default data-toggle=\"modal\" data-target=\"#myModal\"><i class=\"fas fa-plus\"></i></button>"; 
        }
        document.getElementById("updateEvent").innerHTML = html;
      });
    });
  }

  var row = 0;

  function populatePayee(x) {
    row = x.rowIndex;
    alert(row)
    var opt = '';
    myDBInstance.transaction(function (tran) {
      tran.executeSql('SELECT DISTINCT users.Name FROM users INNER JOIN GroupEvent ON GroupEvent.gid = EventMembers.gid INNER JOIN EventMembers ON users.userid = EventMembers.id where EventMembers.eid=?', [row], function(tran1, data) {
        for(i=0;i<data.rows.length;i++) {
          opt += '<option>' + data.rows[i].Name + '</option>';
          alert(opt);
        }
        document.getElementById("payee").innerHTML = opt;
      });
    });
  }

  function updateCash() {
    myDBInstance.transaction(function (tran) {
      tran.executeSql('UPDATE GroupEvent SET cash = cash + ? where eid = ?', [document.getElementById("gcash").value, row])
      var payee = document.getElementById("payee").value;
      var c = document.getElementById("gcash").value
      if(payee == "Me") {
        tran.executeSql('UPDATE Income SET income = income - ? where id = (SELECT userid from users where Name = "Me")', [document.getElementById("gcash").value]);
      }
      tran.executeSql('SELECT Cash.cash, users.Name, users.userid, EventMembers.eid, EventMembers.gid, groupofexpense.groupname FROM EventMembers INNER JOIN Cash ON EventMembers.id = Cash.id INNER JOIN groupofexpense ON groupofexpense.id = EventMembers.gid INNER JOIN users ON users.userid = EventMembers.id where EventMembers.eid = ?', [row], function(tran1, data) {
        var n = data.rows.length;
        tran1.executeSql('UPDATE groupofexpense SET Cash = Cash + ?', [c]);
        for (i = 0; i < n; i++) {
          if(payee != data.rows[i].Name){
            tran.executeSql('insert into Bill(groupevent, paidby, paysto, cash, gid) values(?, ?, ?, ?, ?)', [data.rows[i].groupname, data.rows[i].Name, payee, (Number((document.getElementById("gcash").value)/n).toFixed(2)), data.rows[i].gid]);
          }
          tran.executeSql('UPDATE Cash SET cash = cash - ? where (id = ? and id in (SELECT userid from users where (Name != ?)))', [(Number((document.getElementById("gcash").value)/n).toFixed(2)), data.rows[i].userid, payee]);
          tran.executeSql('UPDATE Cash SET cash = cash + ? where (id = ? and id = (SELECT userid from users where (Name = ?)))', [((n-1)*(Number((document.getElementById("gcash").value)/n).toFixed(2))), data.rows[i].userid, payee]);
        }
      });
    });
    printBalance();
    initialcalc();
    printTab();
    printEvent();
    printBill();
    html = "<div class=\"alert alert-success alert-dismissible\"><a href=\"#\" class=\"close\" data-dismiss=\"alert\" aria-label=\"close\">&times;</a><strong>Success!</strong> Group Updated.</div>";
    document.getElementById("alertbox").innerHTML = html;
  }

  var count = 1;
  function addUserToGroup() {
    var element = document.createElement("input");
    element.setAttribute("type", "text-left");
    element.setAttribute("name", "Name");
    element.setAttribute("id", count);
    element.setAttribute("class", "form-control");
    element.setAttribute("placeholder", "Name");
    count++;
    document.getElementById("dynamic-name").appendChild(element);
  }

  function groupAdd() {
    myDBInstance.transaction(function (tran) {
      var z = document.getElementById("groupname").value;
      tran.executeSql('insert into groupofexpense(groupname, Cash) values(?, ?)', [z, 0]);
      tran.executeSql('insert into groupmembers(userid, groupid) values((SELECT userid FROM users where Name = "Me"), (SELECT id FROM groupofexpense where groupname = ?))', [z]);
      for(i=0;i<count;i++) {
        var x = document.getElementById(i).value;
        tran.executeSql('insert or ignore into users(Name) values(?)', [x]);
        tran.executeSql('insert or ignore into Cash(id, cash) values((SELECT userid from users where Name = ?), 0)', [x]);
        tran.executeSql('insert into groupmembers(userid, groupid) values((SELECT userid FROM users where Name = ?), (SELECT id FROM groupofexpense where groupname = ?))', [x, z]);
      }
    });
    document.getElementById("Form").style.display = "none";
    html = "<div id=\"Adde\"><button class=\"btn btn-default\" onClick=\"displays()\">Add another Group</button><br><br><div class=\"alert alert-success alert-dismissible\"><a href=\"#\" class=\"close\" data-dismiss=\"alert\" aria-label=\"close\">&times;</a><strong>Success!</strong> Group Added.</div><\div>";
    document.getElementById("alertbox").innerHTML = html;
  }

  function displays() {
    document.getElementById("Form").style.display = "block";
    document.getElementById("Adde").style.display = "none";
    document.forms["myForm"].reset();
  }

  function updateGroup(){
    myDBInstance.transaction(function (tran) {
      tran.executeSql('UPDATE groupofexpense SET Cash =  Cash + ? where id = ?', [document.getElementById("gcash").value, document.getElementById("gid").value]);
      var payee = document.getElementById("payee").value;
      var opt = [];
      var gi = Number(document.getElementById("gid").value);
      var sel = document.getElementById("Users");
      tran.executeSql('insert into GroupEvent(gid, groupevent, cash) values(?, ?, ?)', [gi, document.getElementById("event").value, document.getElementById("gcash").value]);
      var eid;
      tran.executeSql('SELECT eid FROM GroupEvent where (groupevent=? and gid = ?)', [document.getElementById("event").value, gi], function(tran1, data1) {
        eid = data1.rows[0].eid;
      })
      for(i=0; i<sel.options.length; i++) {
        if(sel.options[i].selected) {
          opt.push(sel.options[i].value);
        }
      }
      if(payee == "Me") {
        tran.executeSql('UPDATE Income SET income = income - ? where id = (SELECT userid from users where Name = "Me")', [document.getElementById("gcash").value]);
      }
      var k = opt.length;
      tran.executeSql('SELECT groupmembers.userid, users.Name FROM groupmembers INNER JOIN users ON groupmembers.userid = users.userid where groupid = ?', [gi], function(tran, data) {
        var n = data.rows.length;
        for (i = 0, j=0; i < n, j<k; i++) {
          if(opt.includes(data.rows[i].Name)) {
            j++;
            tran.executeSql('insert into EventMembers(id, gid, eid) values(?,?,?)', [data.rows[i].userid, gi, eid]);
            if(payee != data.rows[i].Name){
              tran.executeSql('insert into Bill(groupevent, paidby, paysto, cash, gid) values(?, ?, ?, ?, ?)', [document.getElementById("event").value, data.rows[i].Name, payee, (Number((document.getElementById("gcash").value)/k).toFixed(2)), gi]);
            }
            tran.executeSql('UPDATE Cash SET cash = cash - ? where (id = ? and id in (SELECT userid from users where (Name != ?)))', [(Number((document.getElementById("gcash").value)/k).toFixed(2)), data.rows[i].userid, payee]);
            tran.executeSql('UPDATE Cash SET cash = cash + ? where (id = ? and id = (SELECT userid from users where (Name = ?)))', [((k-1)*(Number((document.getElementById("gcash").value)/k).toFixed(2))), data.rows[i].userid, payee]);
          }
        }
      });
      printBalance();
      initialcalc();
      printBill();
      printTab();
      html = "<div class=\"alert alert-success alert-dismissible\"><a href=\"#\" class=\"close\" data-dismiss=\"alert\" aria-label=\"close\">&times;</a><strong>Success!</strong> Group Updated.</div>";
      document.getElementById("alertbox").innerHTML = html;
    });
  }

  function initialcalc(){
    document.getElementById("para").innerHTML = "";
    myDBInstance.transaction(function (tran) {
      var l;
      tran.executeSql('SELECT gid, count(gid) from Bill group by gid', [], function(tran2, data2) {
        l = data2.rows.length;
        for(i=0;i<l;i++) {
          (function() {
            var res = new Map();
            tran2.executeSql('SELECT paidby, paysto, cash from Bill where gid=?', [Number(data2.rows[i].gid)], function(tran1, data1) {
              for(j=0;j<data1.rows.length;j++) {
                var k1 = res.get(data1.rows[j].paidby);
                var k2 = res.get(data1.rows[j].paysto);
                if(k1) {
                  res.set(data1.rows[j].paidby, k1-data1.rows[j].cash);
                }            
                else {
                  res.set(data1.rows[j].paidby, -data1.rows[j].cash);
                }
                if(k2) {
                  res.set(data1.rows[j].paysto, k2+data1.rows[j].cash);
                }
                else {
                  res.set(data1.rows[j].paysto, data1.rows[j].cash);
                }
              }
            });
            var html = "<div id=\"para" + i + "\">" + "group" + Number(i+1) + "</div><br>";
            document.getElementById("para").innerHTML += "<div id=\"para" + i + "\">" + "Group" + Number(i+1) + " : </div><br>";
            calc(res, i);
          })();
        }
      });
    });
  }

  function findkey(res, val) {
    var s = res.keys();
    for(var ele of s){
      if(res.get(ele) == val){
        return ele;
      }
    }
  }

  function calc(res, i) {
    myDBInstance.transaction(function (tran) {
      var max = (Math.max(...res.values()));
      var key1 = findkey(res, max);
      var min = (Math.min(...res.values()));
      var key2 = findkey(res, min);
      if (res.get(key1) < 1 && res.get(key2) < 1) 
        return;
      var minimum = Math.min(-res.get(key2), res.get(key1));
      var k1 = res.get(key1);
      res.set(key1, k1-minimum);
      var k2 = res.get(key2);
      res.set(key2, k2+minimum);
      document.getElementById("para"+i).innerHTML += "<br>" + key2 + " pays " + minimum + " to " + key1;
      calc(res, i);
    });
  }

  function populate() {
    var opt = '';
    myDBInstance.transaction(function (tran) {
      tran.executeSql('SELECT id FROM groupofexpense', [], function(tran, data) {
        for(i=0;i<data.rows.length;i++) {
          opt += '<option>' + data.rows[i].id + '</option>';
        }
        document.getElementById("gid").innerHTML = opt;
      });
    });
  }

  function populateName(){
    var sel = document.getElementById("Users");
    var opt, html='';
    for(i=0;i<sel.options.length; i++) {
      opt = sel.options[i];
      if(opt.selected) {
        html += '<option>' + opt.value + '</option>';
      }
    }
    document.getElementById("payee").innerHTML = html;
  }

  function populateUsers() {
    var opt = '';
    var x = Number(document.getElementById("gid").value);
    myDBInstance.transaction(function (tran) {
      tran.executeSql('SELECT Name FROM users where (userid in (SELECT userid FROM groupmembers where groupid = ?))', [x], function(tran, data) {
        for(i=0;i<data.rows.length;i++) {
          opt += '<option>' + data.rows[i].Name + '</option>';
        }
        document.getElementById("Users").innerHTML = opt;
      });
    });
  }
}