import { Image, StyleSheet, Platform, FlatList, View, Pressable, Dimensions, Text, ScrollView, TextInput } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useEffect, useState } from 'react';
import { TodoDto } from '@/models/todosDto';
import { TodoForm } from '@/models/todoForm';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addTodo, completeTodo, deleteTodo, fetchAllTodos, FilterType, openTodo } from '@/api/api';
import { useTodosQuery } from '@/api';
import { todoQueryOptions } from '@/api/queries/Todos/todoQueryOptions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, borderWidth } from '@/constants';
import { CustomButton } from '@/components/ui';
import Animated, { FadeInUp } from 'react-native-reanimated';
import uuid from 'react-native-uuid';

export default function HomeScreen() {
  // hooks
  const [title, setTitle] = useState('');
  const [editMode, setEditMode] = useState(false);
  const queryClient = useQueryClient();
  const { bottom, top } = useSafeAreaInsets();

  const { data, isFetching, error, refetch } = useTodosQuery('all');

  const { mutate } = useMutation(
    {
      mutationFn: addTodo,
      onMutate: async (newTodo: TodoDto) => {
        await queryClient.cancelQueries({ queryKey: ['todos'] });

        const previous: TodoDto[] | undefined = queryClient.getQueryData(['todos']);
        // Optimistically update to the new value
        queryClient.setQueryData(['todos'], (old: TodoDto[]) => {
          return [...old, { ...newTodo, todoId: uuid.v4() }];
        });
        // Return a context object with the snapshotted value
        console.log('🚀 ~ onMutate: ~ previous:', previous);
        return { previous };
      },
      // onError: (err, newTodo, context) => {
      //   queryClient.setQueryData(['todos'], context?.previous);
      // },
      // Refetch when done
      onSettled: () => {
        console.log('🚀 ~ HomeScreen ~ queryClient:');

        queryClient.invalidateQueries();
        if (Platform.OS == 'web') {
          refetch();
        }
      },
    },
    queryClient,
  );

  const { mutate: deleteTodoMutation } = useMutation({
    mutationFn: deleteTodo,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previous: TodoDto[] | undefined = queryClient.getQueryData(['todos']);
      // Optimistically update to the new value
      queryClient.setQueryData(['todos'], (old: TodoDto[]) => {
        const newArray = old.filter((x) => x.todoId !== id);
        return newArray;
      });
      // Return a context object with the snapshotted value
      return { previous };
    },
    // Refetch when done
    onSettled: () => {
      //   console.log('🚀 ~ HomeScreen ~ queryClient:', queryClient.unmount);
      queryClient.invalidateQueries();
      if (Platform.OS == 'web') {
        refetch();
      }
    },
  });

  const { mutate: completionMutation } = useMutation({
    mutationFn: completeTodo,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      const previous: TodoDto[] | undefined = queryClient.getQueryData(['todos']);

      const todoToUpdate = previous?.find((x) => x.todoId === id);
      if (todoToUpdate) {
        const newObj = { ...todoToUpdate, completedAt: new Date() };
        queryClient.setQueryData(['todos'], (old: TodoDto[]) => {
          return [...old, newObj];
        });
        // Return a context object with the snapshotted value
        return { previous };
      }
      // Optimistically update to the new value
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['todos'], context?.previous);
      const todoToUpdate = context?.previous?.find((x) => x.todoId === id);
      if (todoToUpdate) {
        const newObj = { ...todoToUpdate, completedAt: new Date() };
        queryClient.setQueryData(['todos'], (old: TodoDto[]) => {
          return [...old, newObj];
        });
        // Return a context object with the snapshotted value
      }
    },
    // Refetch when done
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      if (Platform.OS == 'web') {
        refetch();
      }
    },
  });

  const { mutate: openTodoMutation } = useMutation({
    mutationFn: openTodo,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      const previous: TodoDto[] | undefined = queryClient.getQueryData(['todos']);
      const todoToUpdate = previous?.find((x) => x.todoId === id);
      if (todoToUpdate) {
        const newObj = { ...todoToUpdate, completedAt: null };
        queryClient.setQueryData(['todos'], (old: TodoDto[]) => {
          return [...old, newObj];
        });
        // Return a context object with the snapshotted value
        return { previous };
      }
      // Optimistically update to the new value
    },
    onError: (error) => {
      console.log(error, 'ERROR');
    },
    // Refetch when done
    onSettled: () => {
      queryClient.invalidateQueries();
      if (Platform.OS == 'web') {
        refetch();
      }
    },
  });

  // handlers
  const handleAddNew = () => {
    console.log(title);
    const newTodo: TodoForm = {
      title: title,
    };
    mutate(newTodo);
  };

  const handlePressCheckbox = (id: number) => {
    const foundItem = data?.find((x) => x.todoId === id);
    if (foundItem?.completedAt) {
      openTodoMutation(id);
    } else {
      completionMutation(id);
    }
  };

  const handleDelete = (id?: number) => {
    if (id) {
      deleteTodoMutation(id);
    }
  };
  return (
    <View style={[styles.container, { marginBottom: bottom, marginTop: top }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 4 }}>
        <View style={{ flex: 1 }}>
          <Text>ToDo List</Text>
        </View>
        {error && (
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text>Unable to reach API</Text>
          </View>
        )}
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <CustomButton
            label={editMode ? 'Editing' : 'Edit Mode'}
            buttonType={'primary'}
            buttonSize={'small'}
            onPress={() => {
              setEditMode(!editMode);
            }}
          />
        </View>
      </View>
      <Animated.FlatList
        entering={Platform.OS !== 'web' ? FadeInUp : undefined}
        data={data}
        contentContainerStyle={{ height: Dimensions.get('screen').height - 100, flexGrow: 1 }}
        ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
        scrollEnabled
        renderItem={({ item, index }) => {
          return (
            <View style={{ padding: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row' }}>
                <Pressable
                  onPress={() => handlePressCheckbox(item.todoId ?? 0)}
                  style={[styles.checkbox, item.completedAt ? { backgroundColor: 'blue' } : { backgroundColor: 'transparent' }]}
                />
                <Text>{item.title}</Text>
              </View>
              {editMode && (
                <CustomButton
                  onPress={() => handleDelete(item?.todoId)}
                  label={'X'}
                  buttonType={'danger'}
                  buttonSize={'small'}
                  variant={'round'}
                />
              )}
            </View>
          );
        }}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 4 }}>
        <View style={{ flex: 1 }}>
          <TextInput
            style={{ padding: 4, borderWidth: 1, borderColor: 'black', color: 'black' }}
            value={title}
            onChangeText={(val) => setTitle(val)}
            placeholder={'Enter a todo item'}
          />
        </View>
        <View>
          <Pressable onPress={handleAddNew} style={[{ width: 60, padding: 4, borderRadius: 4, backgroundColor: 'blue' }]}>
            <Text style={{ color: 'white', textAlign: 'center' }}>Add</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    height: Dimensions.get('screen').height - 200,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  checkbox: {
    borderRadius: borderRadius,
    borderWidth: borderWidth,
    borderColor: 'black',
    marginRight: 4,
    width: 24,
    height: 24,
  },
});
