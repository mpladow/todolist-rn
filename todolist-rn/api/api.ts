import { TodoDto } from '@/models/todosDto';

const url = process.env.EXPO_PUBLIC_API_URL ?? "";

export const fetchAllTodos = async (): Promise<TodoDto[]> => {
	try {
		const ENDPOINT = `Todo/GetAllTodos`;
		const response = await fetch(`${url}${ENDPOINT}`, {
			method: 'GET', 
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
		})
		
		if (!response.ok) {
			throw new Error(`Failed to fetch todos: ${response.statusText}`);
		}
		
		const data = await response.json();
		console.log('Successfully fetched todos from API');
		return data;
	} catch (error) {
		console.log('API fetch failed, will use cached data:', error);
		// Re-throw the error so TanStack Query can handle it appropriately
		throw error;
	}
}

export const addTodo = async (newTodo: TodoDto) => {
	const ENDPOINT = `Todo/AddTodo`;
	const response = await fetch(`${url}${ENDPOINT}`, {
		method: 'POST', headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(newTodo)
	})
	return response.json();
}

export const syncTodoList = async (newTodos: TodoDto[]) => {
	try {
		const ENDPOINT = `Todo/SyncTodoList`;
		const response = await fetch(`${url}${ENDPOINT}`, {
			method: 'POST', headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(newTodos)
		})
		
		if (!response.ok) {
			throw new Error(`Sync failed: ${response.statusText}`);
		}
		
		const result = await response.json();
		console.log('Successfully synced todos to API');
		return result;
	} catch (error) {
		console.log('Sync to API failed:', error);
		// Re-throw with network-specific error type for retry logic
		// if (error instanceof TypeError || error.message.includes('fetch')) {
		// 	throw new Error(`NetworkError: ${error.message}`);
		// }
		throw error;
	}
}


export const deleteTodo = async (todoId: number) => {
	const ENDPOINT = `Todo/DeleteTodo`;

	const response = await fetch(`${url}${ENDPOINT}?todoId=${todoId}`, {
		method: 'DELETE', headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
	})
	return response.json();
}

export const completeTodo = async (todoId: number) => {
	const ENDPOINT = `Todo/CompleteTodo`;

	const response = await fetch(`${url}${ENDPOINT}?todoId=${todoId}`, {
		method: 'PUT', headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		body:
			JSON.stringify(new Date().toISOString())
	})
	return response.json();
}
export const openTodo = async (todoId: number) => {
	const ENDPOINT = `Todo/OpenTodo`;

	const response = await fetch(`${url}${ENDPOINT}?todoId=${todoId}`, {
		method: 'PUT', headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
	})
	return response.json();
}