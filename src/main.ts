import AutoBinder from "./AutoBinder";

const user = { name: "John" };

const binder = new AutoBinder<typeof user>()

binder.bind(user, 'name', (newValue: string) => {
    console.log(`User's name changed to ${newValue}`)
})

user.name = "Michael"