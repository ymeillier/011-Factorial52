


# Firebase

### Firebase project
We create a new project from the firebase console:

[https://console.firebase.google.com/](https://console.firebase.google.com/)

![](./assets/Notes/file-20251119154047335.png)


then we can use the cli to list it:

```
firebase projects:list
```
![](./assets/Notes/file-20251119153946199.png)

### npm run build:

```
npm run build
```
![](./assets/Notes/file-20251119154317155.png)

**The file in `dist/index.html` is your actual application.** You just created it when you ran `npm run build`

### Firebase project Setup: 
- creates firebase.json (configuration info)
- .firebaserc (project information)
```
firebase init hosting
```

--> use an existing project
![](./assets/Notes/file-20251119154347544.png)


![](./assets/Notes/file-20251119154401840.png)

![](./assets/Notes/file-20251119154415167.png)
![](./assets/Notes/file-20251119154512639.png)
![](./assets/Notes/file-20251119154525661.png)

![](./assets/Notes/file-20251119154537753.png)-->Y

![](./assets/Notes/file-20251119154710718.png)
--> N

![](./assets/Notes/file-20251119154741288.png)
--> No


![](./assets/Notes/file-20251119154808507.png)



cat firebase.json
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```
![](./assets/Notes/file-20251119154935395.png)

.firebaserc
![](./assets/Notes/file-20251119155006387.png)
```json
{
  "projects": {
    "default": "factorial52-785c5"
  }
}
```



### Firebase deploy

```
firebase deploy
```

![](./assets/Notes/file-20251119155135218.png)


```
Project Console: https://console.firebase.google.com/project/factorial52-785c5/overview
Hosting URL: https://factorial52-785c5.web.app
```


### firebase apps:list