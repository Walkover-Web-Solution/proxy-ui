export class generateRandomPass {
    //String.fromCharCode() function is used to create a string from the given sequence of UTF-16 code units
    private getRandomUpperCase(): string {
        return String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    }

    private getRandomLowerCase(): string {
        return String.fromCharCode(Math.floor(Math.random() * 26) + 97);
    }

    private getRandomNumber(): string {
        return String.fromCharCode(Math.floor(Math.random() * 10) + 48);
    }

    private getRandomSymbol(): string {
        var symbol = '!@#$%^&*(){}[]=<>/,.|~?';
        return symbol[Math.floor(Math.random() * symbol.length)];
    }

    public generatePassword(upper: boolean, lower: boolean, number: boolean, symbol: boolean, length: number): string {
        let generatedPassword = '';
        const typesArr = [{ upper }, { lower }, { number }, { symbol }].filter((item) => Object.values(item)[0]);
        const typesCount = typesArr.length;
        if (typesCount === 0) {
            return '';
        }
        for (let i = 0; i < length; i += typesCount) {
            typesArr.forEach((type) => {
                const funcName = Object.keys(type)[0];
                generatedPassword += this.returnString(funcName);
            });
        }
        const finalPassword = generatedPassword.slice(0, length);
        return finalPassword;
    }

    private returnString(which) {
        if (which === 'upper') {
            return this.getRandomUpperCase();
        } else if (which === 'lower') {
            return this.getRandomLowerCase();
        } else if (which === 'number') {
            return this.getRandomNumber();
        } else if (which === 'symbol') {
            return this.getRandomSymbol();
        }
    }
}
