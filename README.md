# Welcome to your Expo app 👋

Todo List

## Key packages

    Tanstack Query - for syncing front end with back end
	 TODO: enable tanstack to persist data locally when api continues to error.
	 Immer: for state mutation
	  

## Get started locally

## to run on Expo GO, you MUST have Expo GO 53 installed. It will not work on versions below 53.


1. Install dependencies

      ```bash
      npm install
      ```

2. Start the app

      ```bash
       npx expo start
      ```

3. Start the API in visual studio/visual code

4. Update the .env.development file to the localhost port for the running API (if required)
      ```bash
      EXPO_PUBLIC_API_URL = https://localhost:44374/api/
      ```
5. For web, you should be able to access via

```bash
http://localhost:8081
```

6.

### Please note: data syncing will NOT work on Android/iOS at the present time as we using a locally running API. However, data will run locally
