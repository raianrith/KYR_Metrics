-- App no longer tracks weekly cadence; normalize any existing rows to monthly
UPDATE metrics SET cadence = 'monthly' WHERE cadence::text = 'weekly';
