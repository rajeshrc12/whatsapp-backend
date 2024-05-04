# WhatsApp Backend

## Project Installation

1. **Clone the Project:**

````
 git clone https://github.com/rajeshrc12/whatsapp-backend.git
```

2. **Navigate to Project Directory:**
````

cd whatsapp-backend

```

3. **Create `.env` File:**

- Create a file named `.env` in the root folder.
- Add the following variables to the `.env` file:
```

DB_USERNAME=
DB_PASSWORD=
DB_URL=
DB_NAME=
PORT=

```
- For `DB_URL`, use the following sample URL structure:
```

mongodb+srv://<username>:<password>@cluster0.code12345.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

```
Replace `<username>` and `<password>` with your MongoDB username and password respectively.
The value for `DB_URL` should be `cluster0.code12345.mongodb.net`.

4. **Install Dependencies:**
```

npm install

```

5. **Start the Project:**
```

npm start

```

```
