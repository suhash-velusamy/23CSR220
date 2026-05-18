# Run Instructions

This repository contains three backend folders:

- `logging_middleware/`
- `vehicle_maintenance_scheduler/`
- `notification/`

## 1. Run the logger module

If you have a script that uses `logging_middleware/logger.js`, run it from the repository root.

Example:

```bash
cd C:\Users\Admin\Desktop\23CSR220
node logging_middleware/logger.js
```

## 2. Run the vehicle scheduler

```bash
cd C:\Users\Admin\Desktop\23CSR220\vehicle_maintenance_scheduler
node scheduler.js
```

## 3. Run the notification priority script

```bash
cd C:\Users\Admin\Desktop\23CSR220\notification
node notification_priority.js
```

## 4. Environment setup

Make sure the repository root contains a `.env` file with the required values:

```env
AUTH_URL=http://4.224.186.213/evaluation-service/auth
CLIENT_ID=548ed750-6cbb-4b50-9c0e-47194e8018a7
CLIENT_SECRET=wnTcmQJxtmusQncW
AUTH_TOKEN=<your-token>
EMAIL=suhashv.23cse@kongu.edu
NAME="suhash v"
ROLLNO=23csr220
ACCESS_CODE=RyZBcy
```

## 5. Notes

- Use `GET` for the notifications API: `http://4.224.186.213/evaluation-service/notifications`
- If your script needs a token, the code will automatically refresh it using `AUTH_URL` when possible.
