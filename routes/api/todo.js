var express = require('express');
var db = require('../../db');
const { v4: uuid } = require('uuid');

async function getItems() {
    return new Promise((acc, rej) => {
        db.all('SELECT * FROM todo_items', (err, rows) => {
            if (err) return rej(err);
            acc(
                rows.map(item =>
                    Object.assign({}, item, {
                        completed: item.completed === 1,
                    }),
                ),
            );
        });
    });
}

async function getItem(id) {
    return new Promise((acc, rej) => {
        db.all('SELECT * FROM todo_items WHERE id=?', [id], (err, rows) => {
            if (err) return rej(err);
            acc(
                rows.map(item =>
                    Object.assign({}, item, {
                        completed: item.completed === 1,
                    }),
                )[0],
            );
        });
    });
}

async function storeItem(item) {
    return new Promise((acc, rej) => {
        db.run(
            'INSERT INTO todo_items (id, name, completed) VALUES (?, ?, ?)',
            [item.id, item.name, item.completed ? 1 : 0],
            err => {
                if (err) return rej(err);
                acc();
            },
        );
    });
}

async function updateItem(id, item) {
    return new Promise((acc, rej) => {
        db.run(
            'UPDATE todo_items SET name=?, completed=? WHERE id = ?',
            [item.name, item.completed ? 1 : 0, id],
            err => {
                if (err) return rej(err);
                acc();
            },
        );
    });
} 

async function removeItem(id) {
    return new Promise((acc, rej) => {
        db.run('DELETE FROM todo_items WHERE id = ?', [id], err => {
            if (err) return rej(err);
            acc();
        });
    });
}

var router = express.Router();

router.get('/', async (req, res, next) => {
    const items = await getItems();
    res.send(items);
});

router.post('/', async (req, res, next) => {
    const item = {
        id: uuid(),
        name: req.body.name,
        completed: false,
    };

    await storeItem(item);
    res.send(item);
});

router.put('/:id', async (req, res, next) => {
    await updateItem(req.params.id, {
        name: req.body.name,
        completed: req.body.completed,
    });
    const item = await getItem(req.params.id);
    res.send(item);
});

router.delete('/:id', async (req, res, next) => {
    await removeItem(req.params.id);
    res.sendStatus(200);
});

module.exports = router;
