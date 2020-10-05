export const log = (data: any) => {
    switch (data.Event) {
        case 'Error':
            console.error(`[${new Date().toLocaleTimeString()}] ${data.Name}: ${data.Event}`);
            Object.keys(data.Data).forEach(x => console.error(`${x}: ${data.Data[x]}`));
            break;
        default:
            console.log(`[${new Date().toLocaleTimeString()}] ${data.Name}: ${data.Event}`);
            break;

    }
}