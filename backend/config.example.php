<?php
return [
  'debug' => true,
  'swiftmailer.transport' => Swift_SendmailTransport::newInstance('/usr/sbin/sendmail -bs'),
];
