import { TodoForm } from '@/models/todoForm';
import { TodoDto } from '@/models/todosDto';

const url = process.env.EXPO_PUBLIC_API_URL ?? "";
export type FilterType = "all" | "completed" | "notCompleted"


export const fetchAllTodos = async (): Promise<TodoDto[]> => {
	const TODO_ENDPOINT = 'api/Todo/GetAllTodos'
	const response = await fetch(`${url}/${TODO_ENDPOINT}`)
	return response.json();
}
export const fetchTodosWithFilter = async (filter: FilterType): Promise<TodoDto[]> => {
	const TODO_ENDPOINT = 'api/Todo/GetAllTodosByFilter'
	const response = await fetch(`${url}${TODO_ENDPOINT}?filter=${filter}`)
	return response.json();
}

export const addTodo = async (newTodo: TodoDto) => {
	console.log("🚀 ~ addTodo ~ newTodo:", newTodo)
	const ENDPOINT = `api/Todo/AddTodo`;
	const response = await fetch(`${url}/${ENDPOINT}`, {
		method: 'POST', headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(newTodo)
	})
	return response.json();
}
export const completeTodo = async (todoId: number) => {
	const response = await fetch(`api/Todo/CompleteTodo?todoId=${todoId}`, {
		method: 'PUT', headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		body: new Date().toString()
	})
	return response.json();
}
export const openTodo = async (todoId: number) => {
	const response = await fetch(`api/Todo/OpenTodo?todoId=${todoId}`, {
		method: 'PUT', headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
	})
	return response.json();
}