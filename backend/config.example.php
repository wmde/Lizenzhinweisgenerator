<?php
return [
  'debug' => true,
  'swiftmailer.transport' => Swift_SendmailTransport::newInstance('/usr/sbin/sendmail -bs'),
  'feedback_email' => 'mail@example.com', // the email address that receives the feedback
];
