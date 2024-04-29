import {
    Canister,
    Err,
    Ok,
    Opt,
    Principal,
    query,
    Record,
    Result,
    StableBTreeMap,
    text,
    update,
    Variant,
    Vec
} from 'azle';

const Message = Record({
    id: Principal,
    title: text,
    start: text,
    duration: text,
    typeMsg: text
    
});
type Message = typeof Message.tsType;

const AplicationError = Variant({
    MessageDoesNotExist: text
});

type AplicationError = typeof AplicationError.tsType;

let messages = StableBTreeMap<Principal, Message>(0);

export default Canister({
    createMessage: update([text, text, text, text], Message, (title, start, typeMsg, duration) => {
        const id = generateId();
        const message: Message = {
            id:id,
            title: title,
            start: start,
            duration: duration,
            typeMsg: typeMsg            
        };

        messages.insert(message.id, message);

        return message;
    }),
    readmessages: query([], Vec(Message), () => {
        return messages.values();
    }),
    readmessageById: query([text], Opt(Message), (id) => {
        return messages.get(Principal.fromText(id));
    }),

    deletemessage: update([text], Result(Message, AplicationError), (id) => {
        const messageOpt = messages.get(Principal.fromText(id));

        if ('None' in messageOpt) {
            return Err({
                MessageDoesNotExist: id
            });
        }

        const message = messageOpt.Some;
        messages.remove(message.id);
        return Ok(message);
    }),
    updatemessage: update(
        [text, text, text, text, text],
        Result(Message, AplicationError),
        (messageId, title, start, typeMsg, duration) => {
            const messageOpt = messages.get(Principal.fromText(messageId));

            if ('None' in messageOpt) {
                return Err({
                    MessageDoesNotExist: messageId
                });
            }
            const newmessage: Message = {
                id:Principal.fromText(messageId),
                title: title,
                start: start,
                typeMsg: typeMsg,
                duration: duration
            };

            messages.remove(Principal.fromText(messageId))
            messages.insert(Principal.fromText(messageId), newmessage);

            return Ok(newmessage);
        }
    )
})

function generateId(): Principal {
    const randomBytes = new Array(29)
        .fill(0)
        .map((_) => Math.floor(Math.random() * 256));

    return Principal.fromUint8Array(Uint8Array.from(randomBytes));
}