//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../src/extension';

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", () => {

    // Defines a Mocha unit test
    test("Default Wrappers", () => {
        // All default wrappers are fine
        assert.equal(myExtension.getWrapper('Javascript'), 'console.log(\'$eSEL\', $SEL)');
        assert.equal(myExtension.getWrapper('default'), 'print($SEL);');
        assert.equal(myExtension.getWrapper('PHP'), "echo '<pre>$eSEL<br />'; var_dump($SEL); echo '</pre>';");

        // Javascript wrapper == Typescript wrapper
        assert.equal(myExtension.getWrapper('Javascript'), myExtension.getWrapper('typescript'));

        // Non case sensitive
        assert.equal(myExtension.getWrapper('JavaSCRipt'), myExtension.getWrapper('javascript'));

        // If don't find wrapper, replace with defaul wrapper
        assert.equal(myExtension.getWrapper('lorem ipsum'), myExtension.getWrapper('default'));
    });

    test("Format wrappers", () => {
        // Simple execution
        assert.equal(myExtension.wrapText('Lorem Ipsum', '$SEL and $eSEL'), 'Lorem Ipsum and Lorem Ipsum');
        
        // Escaping quotes
        assert.equal(myExtension.wrapText('Lor"e"m Ipsum', '$SEL and $eSEL'), 'Lor"e"m Ipsum and Lor\\"e\\"m Ipsum');
        
        // Escaping simple and double quotes
        assert.equal(myExtension.wrapText('Lor"e"m Ips\'u\'m', '$SEL and $eSEL'), `Lor"e"m Ips'u'm and Lor\\"e\\"m Ips\\'u\\'m`);
    });
});