# README #
Module 5

### Important
* It was approved by the instructor Todd Sproull to upload the assignment contents to personal repository, but you may not
use or adapt the implementation here into your assignment without permission from the instructor and the citation, otherwise it will
violate the academic integrity of your department.

Right click days to interact with the calendar.
### Memo-reference ###
##### The majority of the below are merely either tutorials or manuals.
##### Hence, in most of the cases, they only provide a general concept of how-to, rather than real codes (i.e. reading materials).
* W3school:w3-nav bar items.
* [PHP.net manuals for file writing](http://php.net/manual/en/function.file-put-contents.php)
* [Firebase:start](https://firebase.google.com/docs/web/setup?authuser=0)
* More about Firebase: as a starter, some fixed pattern (like auth, but not main functionality) of code is derived/directly applied from documentation.firebase.google.com/docs/*
* How To (General Idea only): [some rules of css layout](https://stackoverflow.com/questions/15102480/how-to-make-a-parent-div-auto-size-to-the-width-of-its-children-divs) 
* Derive (~ 2 lines): [https://stackoverflow.com/questions/1184334/get-number-days-in-a-specified-month-using-javascript] 
* W3school Tutorial: [Create CSS Modal box](https://www.w3schools.com/howto/howto_css_modals.asp)
* Some extra help from w3 style.
* Manual: W3school: JS Date class
* Manual: [Class declaration in JS](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)
* Manual: [List of html entities: for escaping in javascript](https://www.w3schools.com/html/html_entities.asp)
* Manual in php.net: [Variable of Variable](http://php.net/manual/en/language.variables.variable.php)
* Manual in php.net: [session status](http://php.net/manual/en/function.session-status.php)
* Manual in php.net: [how to send email](http://php.net/manual/en/function.mail.php)
* Manual in php.net: [websocket](http://php.net/manual/en/function.socket-create.php)
* Manual in php.net: [filter_var](http://php.net/manual/en/filter.examples.sanitization.php)

##### To compensate the fact that contextmenu element is only supported by Firefox but not chrome yet, jquery-context-menu API is applied.
* https://swisnl.github.io/jQuery-contextMenu/
### Existing user:
* aaa (pwd: aaaaaa)
### Creative Portion ###
* Further enhance the security by enforcing HTTP Strict Transport Security.
* User will get email notification when time of an event is approaching.
* User dynamically get whether the username is taken or not before click "signup" button.
* Calendar, modal boxes and navbars are wrapped in classes and hence can be managed more effectively. Now dialogue boxes can be easily assembled with different functions based on various class of modal box in javascriot.
* User management page in userhome: change password/change associated email before verified. (After verified, it will be permanent unless contact with webmaster).

* email verification and verification token, simulate the spring security 5 process [Here](http://www.baeldung.com/registration-verify-user-by-email)
Mechanism: 
(1) simulate the UUID object of Spring by uniqueid with prefix of random_bytes(cryptographically secure) and uniqueid(more entropy) method.
The verification token is bounded with user and email in database. User might
re-send new verification tokens to current/new email address before they verify with token, with an interval of 30 minutes, to avoid abuse of mail-sending function.
(2)The verification token has a 24hr lifetime.
(3)The verification token is by $_GET request, and hence can be triggered by a url sent to the email. The url is encoded and contains the username and the token string.
(4) When verifying the token, the system will check whether there is such token
associate with such user and also not expired.
If there is, then check whether the associated email to the token is verified by other users or not.
If the token is valid and the email address is not verified by other user, the verification will be done. THe user will be marked with verified.


