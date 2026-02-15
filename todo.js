
    const STORAGE_KEY = 'responsive_todos_v1';
    let todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    let filter = 'all';

    const $list = document.getElementById('list');
    const $input = document.getElementById('taskInput');
    const $add = document.getElementById('addBtn');
    const $remaining = document.getElementById('remaining');
    const $empty = document.getElementById('emptyState');

    function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(todos)); }

    function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

    function render(){
      $list.innerHTML = '';
      const filtered = todos.filter(t => filter === 'all' ? true : filter === 'active' ? !t.done : t.done);

      if(filtered.length === 0){ $empty.style.display = 'block'; } else { $empty.style.display = 'none'; }

      filtered.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'item';
        li.dataset.id = todo.id;

        const check = document.createElement('button');
        check.className = 'check' + (todo.done ? ' checked' : '');
        check.setAttribute('aria-pressed', String(!!todo.done));
        check.title = todo.done ? 'Mark as not done' : 'Mark as done';
        check.innerHTML = todo.done ? '\u2713' : '';

        const label = document.createElement('div');
        label.className = 'label' + (todo.done ? ' completed' : '');
        label.textContent = todo.text;
        label.tabIndex = 0;

        const actions = document.createElement('div');
        actions.className = 'actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'icon-btn';
        editBtn.title = 'Edit task';
        editBtn.innerHTML = '✎';

        const delBtn = document.createElement('button');
        delBtn.className = 'icon-btn';
        delBtn.title = 'Delete task';
        delBtn.innerHTML = '🗑';

        actions.append(editBtn, delBtn);
        li.append(check, label, actions);
        $list.append(li);

        // Events
        check.addEventListener('click', ()=> toggleDone(todo.id));
        delBtn.addEventListener('click', ()=> removeTodo(todo.id));
        editBtn.addEventListener('click', ()=> startEdit(todo.id, label));
        label.addEventListener('dblclick', ()=> startEdit(todo.id, label));
        label.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') startEdit(todo.id, label); });
      });

      const left = todos.filter(t=>!t.done).length;
      $remaining.textContent = left + (left===1? ' item left' : ' items left');
      save();
    }

    function addTodo(text){
      if(!text.trim()) return;
      todos.unshift({id:uid(), text:text.trim(), done:false});
      $input.value=''; render();
    }

    function toggleDone(id){
      todos = todos.map(t=> t.id===id ? {...t, done: !t.done} : t);
      render();
    }

    function removeTodo(id){
      todos = todos.filter(t=>t.id!==id);
      render();
    }

    function startEdit(id, labelEl){
      const todo = todos.find(t=>t.id===id);
      if(!todo) return;
      const input = document.createElement('input');
      input.type='text'; input.value = todo.text;
      input.className = 'todo-input';
      labelEl.replaceWith(input);
      input.focus();
      // Save on blur or enter
      const finish = ()=>{
        const v = input.value.trim();
        if(v) todo.text = v;
        render();
      }
      input.addEventListener('blur', finish, {once:true});
      input.addEventListener('keydown',(e)=>{ if(e.key==='Enter'){ input.blur(); } if(e.key==='Escape'){ render(); } });
    }

    // Filters
    document.querySelectorAll('[data-filter]').forEach(b=>{
      b.addEventListener('click', ()=>{
        filter = b.dataset.filter; document.querySelectorAll('[data-filter]').forEach(x=>x.classList.remove('active'));
        b.classList.add('active'); render();
      });
    });

    // Add
    $add.addEventListener('click', ()=> addTodo($input.value));
    $input.addEventListener('keydown', (e)=>{ if(e.key==='Enter') addTodo($input.value); });

    // Clear completed
    document.getElementById('clearCompleted').addEventListener('click', ()=>{
      todos = todos.filter(t=>!t.done); render();
    });

    // Export (download JSON)
    document.getElementById('saveBtn').addEventListener('click', ()=>{
      const data = JSON.stringify(todos, null, 2);
      const blob = new Blob([data],{type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href=url; a.download='todos.json'; a.click(); URL.revokeObjectURL(url);
    });

    // basic keyboard shortcuts
    window.addEventListener('keydown',(e)=>{
      if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); $input.focus(); }
      if(e.key==='/' && document.activeElement !== $input){ e.preventDefault(); $input.focus(); }
    });

    // initial render
    render();
  